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
    title: "", department: "", location: "", type: "Full-time",
    description: "", requirements: "", benefits: "", status: "open",
  });

  const load = useCallback(async () => {
    let q = supabase.from("careers").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return toast("Title is required", "error");
    const { error } = editing
      ? await supabase.from("careers").update(form).eq("id", editing.id)
      : await supabase.from("careers").insert(form);
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

  const deleteItem = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("careers").delete().eq("id", confirmDelete.id);
    if (error) return toast(error.message, "error");

    await logActivity({
      action: "delete_career",
      resourceType: "career",
      resourceId: confirmDelete.id,
      resourceTitle: confirmDelete.title,
      details: `Deleted job posting`,
    });

    toast("Deleted", "success");
    setConfirmDelete(null);
    load();
  };

  const columns = [
    { key: "title", header: "Job Title", sortable: true },
    { key: "department", header: "Department" },
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
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setForm({ title: "", department: "", location: "", type: "Full-time", description: "", requirements: "", benefits: "", status: "open" }); setShowForm(true); }}>
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
          { icon: "fa-pen", label: "Edit", onClick: () => { setEditing(r); setForm({ ...r }); setShowForm(true); } },
          { icon: "fa-trash", label: "Delete", onClick: () => setConfirmDelete(r), color: "#e74c3c" },
        ]}
      />

      {showForm && (
        <div className="admin-dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, textAlign: "left", maxHeight: "90vh", overflowY: "auto" }}>
            <h3>{editing ? "Edit Job" : "New Job Opening"}</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Title *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Department</label><input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} /></div>
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
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="admin-field"><label>Description</label><textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="admin-field"><label>Requirements</label><textarea rows={3} value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} /></div>
              <div className="admin-field"><label>Benefits</label><textarea rows={3} value={form.benefits} onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))} /></div>
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
        title="Delete Job"
        message={`Delete "${confirmDelete?.title}"? This action cannot be undone.`}
        onConfirm={deleteItem}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Delete"
      />
    </>
  );
}
