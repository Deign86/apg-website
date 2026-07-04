import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import StatusPill from "@/components/admin/StatusPill";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { useAuth } from "@/context/AuthContext";
import { logActivity } from "@/lib/logActivity";

export default function Users() {
  const toast = useToast();
  const { profile: currentUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", fullName: "", role: "editor" });
  const [saving, setSaving] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  const changeRole = async (userId, role) => {
    if (userId === currentUser?.id) return toast("Cannot change own role", "error");
    const target = rows.find(r => r.id === userId);
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) return toast(error.message, "error");
    await logActivity({ action: "update_user_role", resourceType: "user", resourceId: userId, resourceTitle: target?.email, details: `Changed role to ${role}` });
    toast("Role updated to " + role, "success");
    setRows(p => p.map(r => r.id === userId ? { ...r, role } : r));
  };

  const toggleActive = async (userId) => {
    if (userId === currentUser?.id) return toast("Cannot change own status", "error");
    const target = rows.find(r => r.id === userId);
    const newActive = !target?.active;
    const { error } = await supabase.from("profiles").update({ active: newActive }).eq("id", userId);
    if (error) return toast(error.message, "error");
    await logActivity({ action: newActive ? "activate_user" : "deactivate_user", resourceType: "user", resourceId: userId, resourceTitle: target?.email, details: newActive ? "Activated user" : "Deactivated user" });
    toast(newActive ? "Activated" : "Deactivated", "success");
    setRows(p => p.map(r => r.id === userId ? { ...r, active: newActive } : r));
    setConfirmToggle(null);
  };

  const invite = async () => {
    if (!inviteForm.email.trim()) return toast("Email is required", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}` },
        body: JSON.stringify({ email: inviteForm.email, role: inviteForm.role, fullName: inviteForm.fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invite failed");
      await logActivity({ action: "invite_user", resourceType: "user", resourceId: null, resourceTitle: inviteForm.email, details: `Invited user with role ${inviteForm.role}` });
      toast("Invitation sent to " + inviteForm.email, "success");
      setShowInvite(false);
      setInviteForm({ email: "", fullName: "", role: "editor" });
      setRows(p => [...p, { id: "pending-" + Date.now(), email: inviteForm.email, full_name: inviteForm.fullName, role: inviteForm.role, active: true }]);
    } catch (err) {
      toast(err.message, "error");
    }
    setSaving(false);
  };

  const resetPassword = async (email) => {
    try {
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/admin/login" });
      toast("Password reset email sent", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const isOwner = currentUser?.role === "owner";
  const isAdmin = currentUser?.role === "admin" || isOwner;

  const columns = [
    { key: "email", header: "Email", sortable: true },
    { key: "full_name", header: "Name" },
    { key: "role", header: "Role", render: r => <StatusPill status={r.role} /> },
    { key: "active", header: "Active", render: r => r.active ? <i className="fa-solid fa-circle-check" style={{ color: "#2ecc71" }} /> : <i className="fa-solid fa-circle-xmark" style={{ color: "#e74c3c" }} /> },
    { key: "created_at", header: "Joined", render: r => r.created_at ? new Date(r.created_at).toLocaleDateString() : "—" },
  ];

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Users | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Users</h1>
        {isOwner && (
          <button className="admin-btn admin-btn-primary" onClick={() => setShowInvite(true)}><i className="fa-solid fa-user-plus" /> Invite User</button>
        )}
      </div>

      {!isAdmin && (
        <div className="admin-card" style={{ marginBottom: 16, padding: 12, border: "1px solid #e74c3c" }}>
          <p style={{ margin: 0, color: "#f5a5a5", fontSize: "0.85rem" }}>You have editor access — you can view users but cannot change roles or invite new users.</p>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyIcon="fa-user-shield"
        emptyTitle="No users"
        emptySubtitle="Users will appear here after signup"
        actions={r => {
          const actions = [];
          if (r.id.startsWith("pending-")) return actions;
          if (isOwner) {
            actions.push({
              icon: "fa-shield-halved",
              label: "Role",
              onClick: () => {
                const roles = ["editor", "admin", "owner"];
                const idx = roles.indexOf(r.role);
                if (idx < 0) return;
                const next = roles[(idx + 1) % roles.length];
                changeRole(r.id, next);
              },
            });
          }
          if (isAdmin && r.id !== currentUser?.id && !r.id.startsWith("pending-")) {
            actions.push({
              icon: r.active ? "fa-ban" : "fa-check",
              label: r.active ? "Deactivate" : "Activate",
              color: r.active ? "#e74c3c" : "#2ecc71",
              onClick: () => setConfirmToggle(r),
            });
          }
          if (!r.id.startsWith("pending-")) {
            actions.push({
              icon: "fa-key",
              label: "Reset Password",
              onClick: () => resetPassword(r.email),
            });
          }
          return actions;
        }}
      />

      {isOwner && showInvite && (
        <div className="admin-dialog-overlay" onClick={() => setShowInvite(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: "left" }}>
            <h3>Invite User</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Email *</label><input type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="admin-field"><label>Full Name</label><input value={inviteForm.fullName} onChange={e => setInviteForm(p => ({ ...p, fullName: e.target.value }))} /></div>
              <div className="admin-field">
                <label>Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  {isOwner && <option value="owner">Owner</option>}
                </select>
              </div>
            </div>
            <div className="admin-dialog-actions" style={{ marginTop: 20 }}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={invite} disabled={!inviteForm.email.trim() || saving}>{saving ? "Sending..." : "Invite"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmToggle}
        title={confirmToggle?.active ? "Deactivate User" : "Activate User"}
        message={`${confirmToggle?.active ? "Deactivate" : "Activate"} ${confirmToggle?.email}?`}
        onConfirm={() => toggleActive(confirmToggle.id)}
        onCancel={() => setConfirmToggle(null)}
        confirmLabel={confirmToggle?.active ? "Deactivate" : "Activate"}
      />
    </>
  );
}
