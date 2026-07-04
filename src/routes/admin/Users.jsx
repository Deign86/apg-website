import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import StatusPill from "@/components/admin/StatusPill";
import { useToast } from "@/components/admin/Toast";
import { useAuth } from "@/context/AuthContext";

export default function Users() {
  const toast = useToast();
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email:"", fullName:"", role:"editor" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({data}) => {
      setRows(data || []); setLoading(false);
    });
  }, []);

  const changeRole = async (userId, role) => {
    if (userId === profile?.id) return toast("Cannot change own role", "error");
    await fetch("/api/admin/users/" + userId + "/role", { method:"PUT", headers:{"Content-Type":"application/json","Authorization":"Bearer " + (await supabase.auth.getSession()).data.session?.access_token}, body:JSON.stringify({role}) });
    toast("Role updated", "success");
    setRows(p => p.map(r => r.id === userId ? { ...r, role } : r));
  };

  const toggleActive = async (userId, active) => {
    if (userId === profile?.id) return toast("Cannot change own status", "error");
    await fetch("/api/admin/users/" + userId + "/active", { method:"PUT", headers:{"Content-Type":"application/json","Authorization":"Bearer " + (await supabase.auth.getSession()).data.session?.access_token}, body:JSON.stringify({active}) });
    toast(active ? "Activated" : "Deactivated", "success");
    setRows(p => p.map(r => r.id === userId ? { ...r, active } : r));
  };

  const invite = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/users/invite", { method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer " + (await supabase.auth.getSession()).data.session?.access_token}, body:JSON.stringify(inviteForm) });
    if (!res.ok) { toast((await res.json()).message, "error"); setSaving(false); return; }
    toast("Invitation sent", "success");
    setShowInvite(false); setInviteForm({email:"",fullName:"",role:"editor"}); setSaving(false);
    setRows(p => [...p, { id:"pending", email:inviteForm.email, full_name:inviteForm.fullName, role:inviteForm.role, active:true }]);
  };

  const columns = [
    { key: "email", header: "Email" },
    { key: "full_name", header: "Name" },
    { key: "role", header: "Role", render: r => <StatusPill status={r.role} /> },
    { key: "active", header: "Active", render: r => r.active ? <i className="fa-solid fa-check" style={{color:"#2ecc71"}} /> : <i className="fa-solid fa-xmark" style={{color:"#e74c3c"}} /> },
    { key: "created_at", header: "Joined", render: r => r.created_at ? new Date(r.created_at).toLocaleDateString() : "—" },
  ];

  return (
    <>
      <Helmet><title>Users | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Users</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowInvite(true)}><i className="fa-solid fa-user-plus" /> Invite User</button>
      </div>

      {showInvite && (
        <div className="admin-dialog-overlay" onClick={() => setShowInvite(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{maxWidth:420,textAlign:"left"}}>
            <h3>Invite User</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Email *</label><input type="email" value={inviteForm.email} onChange={e => setInviteForm(p=>({...p,email:e.target.value}))} /></div>
              <div className="admin-field"><label>Full Name</label><input value={inviteForm.fullName} onChange={e => setInviteForm(p=>({...p,fullName:e.target.value}))} /></div>
              <div className="admin-field"><label>Role</label><select value={inviteForm.role} onChange={e => setInviteForm(p=>({...p,role:e.target.value}))}>
                <option value="editor">Editor</option><option value="admin">Admin</option>
              </select></div>
            </div>
            <div className="admin-dialog-actions" style={{marginTop:20}}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={invite} disabled={!inviteForm.email||saving}>{saving?"Sending...":"Invite"}</button>
            </div>
          </div>
        </div>
      )}

      <DataTable columns={columns} rows={rows} loading={loading}
        emptyIcon="fa-user-shield" emptyTitle="No users" emptySubtitle="Users will appear here after signup"
        actions={r => [
          ...(r.id !== "pending" ? [
            { icon:"fa-shield", label:"Role", onClick:() => {
              const roles = ["editor","admin"];
              const idx = roles.indexOf(r.role);
              changeRole(r.id, roles[(idx+1)%roles.length]);
            }},
            { icon: r.active ? "fa-ban" : "fa-check", label: r.active ? "Deactivate" : "Activate", color: r.active ? "#e74c3c" : "#2ecc71", onClick:() => toggleActive(r.id, !r.active) },
          ] : []),
        ]}
      />
    </>
  );
}
