import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import StatusPill from "@/components/admin/StatusPill";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { logActivity } from "@/lib/logActivity";

export default function CareerManager() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    title: "", location: "", type: "Full-time", tag: "",
    description: "", status: "active",
  });

  const load = useCallback(async () => {
    let q = supabase.from("job_openings").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return toast("Title is required", "error");
    const { error } = editing
      ? await supabase.from("job_openings").update(form).eq("id", editing.id)
      : await supabase.from("job_openings").insert(form);
    if (error) return toast(error.message, "error");

    await logActivity({
      action: editing ? "update_career" : "create_career",
      resourceType: "career",
      resourceId: editing ? editing.id : null,
      resourceTitle: form.title,
      details: editing ? `Updated job posting` : `Created job posting`,
    });

    toast("Job " + (editing ? "updated" : "created"), "success");
    setShowForm(false);
    setEditing(null);
    load();
  };

  const closeJob = async (row) => {
    setConfirmDelete(row);
  };

  const confirmClose = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("job_openings").update({ status: "closed" }).eq("id", confirmDelete.id);
    if (error) return toast(error.message, "error");

    await logActivity({
      action: "delete_career",
      resourceType: "career",
      resourceId: confirmDelete.id,
      resourceTitle: confirmDelete.title,
      details: `Closed job posting`,
    });

    toast("Closed", "success");
    setConfirmDelete(null);
    load();
  };

  const restore = async (id) => {
    const { error } = await supabase.from("job_openings").update({ status: "active" }).eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Restored to active", "success");
    load();
  };

  const columns = [
    { key: "title", header: "Job Title", sortable: true },
    { key: "tag", header: "Tag" },
    { key: "location", header: "Location" },
    { key: "type", header: "Type" },
    { key: "status", header: "Status", render: r => <StatusPill status={r.status} /> },
  ];

  const pageSize = 20;

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Careers | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Careers</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setForm({ title: "", location: "", type: "Full-time", tag: "", description: "", status: "active" }); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> New Job
        </button>
      </div>

      <div className="admin-table-toolbar" style={{ marginBottom: 16 }}>
        <input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        search={search}
        onSearch={setSearch}
        pageSize={pageSize}
        loading={loading}
        emptyIcon="fa-briefcase"
        emptyTitle="No jobs yet"
        emptySubtitle="Click New Job to create an opening"
        actions={r => [
          { icon: "fa-pen", label: "Edit", onClick: () => { setEditing(r); setForm({ ...r, tag: r.tag || "" }); setShowForm(true); } },
          ...(r.status === "closed"
            ? [{ icon: "fa-rotate-left", label: "Restore", onClick: () => restore(r.id) }]
            : [{ icon: "fa-ban", label: "Close", onClick: () => closeJob(r), color: "#e67e22" }]),
        ]}
      />

      {showForm && (
        <div className="admin-dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, textAlign: "left", maxHeight: "90vh", overflowY: "auto" }}>
            <h3>{editing ? "Edit Job" : "New Job Opening"}</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Title *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Tag</label><input value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))} placeholder="e.g. Commission Based" /></div>
                <div className="admin-field"><label>Location</label><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="admin-field"><label>Description</label><textarea rows={6} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Include responsibilities, requirements, and benefits here" /></div>
            </div>
            <div className="admin-dialog-actions" style={{ marginTop: 20 }}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={!form.title.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Close Job"
        message={`Close "${confirmDelete?.title}"? It will be hidden from the public careers page. You can restore it later.`}
        onConfirm={confirmClose}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Close"
      />
    </>
  );
}
