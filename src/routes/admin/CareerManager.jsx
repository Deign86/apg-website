import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import StatusPill from "@/components/admin/StatusPill";
import { useToast } from "@/components/admin/Toast";

export default function CareerManager() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title:"", location:"", type:"", tag:"", description:"", status:"active" });

  const load = useCallback(async () => {
    const { data } = await supabase.from("job_openings").select("*").order("created_at", { ascending: false });
    setRows(data || []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const { error } = editing
      ? await supabase.from("job_openings").update(form).eq("id", editing.id)
      : await supabase.from("job_openings").insert(form);
    if (error) return toast(error.message, "error");
    toast("Job " + (editing ? "updated" : "created"), "success");
    setShowForm(false); setEditing(null); load();
  };

  const columns = [
    { key: "title", header: "Title" },
    { key: "location", header: "Location" },
    { key: "type", header: "Type" },
    { key: "tag", header: "Tag" },
    { key: "status", header: "Status", render: r => <StatusPill status={r.status} /> },
  ];

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Careers | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Careers</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setForm({title:"",location:"",type:"",tag:"",description:"",status:"active"}); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> New Job
        </button>
      </div>

      {showForm && (
        <div className="admin-dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{maxWidth:500,textAlign:"left"}}>
            <h3>{editing ? "Edit Job" : "New Job Opening"}</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Title *</label><input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} /></div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Location</label><input value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} /></div>
                <div className="admin-field"><label>Type</label><input value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} /></div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Tag</label><input value={form.tag} onChange={e => setForm(p=>({...p,tag:e.target.value}))} /></div>
                <div className="admin-field"><label>Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                  <option value="active">Active</option><option value="closed">Closed</option><option value="draft">Draft</option>
                </select></div>
              </div>
              <div className="admin-field"><label>Description</label><textarea rows={4} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} /></div>
            </div>
            <div className="admin-dialog-actions" style={{marginTop:20}}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={!form.title}>Save</button>
            </div>
          </div>
        </div>
      )}

      <DataTable columns={columns} rows={rows} search={search} onSearch={setSearch} loading={false}
        emptyIcon="fa-briefcase" emptyTitle="No jobs yet" emptySubtitle="Click New Job to create an opening"
        actions={r => [{ icon:"fa-pen", label:"Edit", onClick:() => { setEditing(r); setForm({...r}); setShowForm(true); }}]}
      />
    </>
  );
}
