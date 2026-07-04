import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import StatusPill from "@/components/admin/StatusPill";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { logActivity } from "@/lib/logActivity";

export default function BlogManager() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", author: "", cover_image: "", tags: [], status: "draft", published_at: "",
  });

  const load = useCallback(async () => {
    let q = supabase.from("blogs").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data, count } = await q;
    setRows(data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return toast("Title is required", "error");
    const pay = { ...form };
    if (!pay.slug) pay.slug = pay.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (pay.status === "published" && !pay.published_at) pay.published_at = new Date().toISOString();
    if (pay.status !== "published") pay.published_at = null;
    pay.tags = (pay.tags || []).filter(Boolean);

    const { error } = editing
      ? await supabase.from("blogs").update(pay).eq("id", editing.id)
      : await supabase.from("blogs").insert(pay);

    if (error) return toast(error.message, "error");

    await logActivity({
      action: editing ? "update_blog" : "create_blog",
      resourceType: "blog",
      resourceId: editing ? editing.id : null,
      resourceTitle: pay.title,
      details: editing ? `Updated blog post` : `Created blog post`,
    });

    toast("Blog " + (editing ? "updated" : "created"), "success");
    setShowForm(false);
    setEditing(null);
    load();
  };

  const duplicate = async (row) => {
    const { error } = await supabase.from("blogs").insert({
      ...row,
      title: row.title + " (Copy)",
      slug: row.slug + "-copy",
      status: "draft",
      published_at: null,
    });
    if (error) return toast(error.message, "error");
    await logActivity({ action: "duplicate_blog", resourceType: "blog", resourceId: row.id, resourceTitle: row.title, details: `Duplicated blog post` });
    toast("Duplicated", "success");
    load();
  };

  const softDelete = async (row) => {
    setConfirmDelete(row);
  };

  const confirmSoftDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("blogs").update({ deleted_at: new Date().toISOString() }).eq("id", confirmDelete.id);
    if (error) return toast(error.message, "error");
    await logActivity({ action: "delete_blog", resourceType: "blog", resourceId: confirmDelete.id, resourceTitle: confirmDelete.title, details: `Soft-deleted blog post` });
    toast("Deleted", "success");
    setConfirmDelete(null);
    load();
  };

  const restore = async (id) => {
    const { error } = await supabase.from("blogs").update({ deleted_at: null }).eq("id", id);
    if (error) return toast(error.message, "error");
    const row = rows.find(r => r.id === id);
    await logActivity({ action: "restore_blog", resourceType: "blog", resourceId: id, resourceTitle: row?.title, details: `Restored blog post` });
    toast("Restored", "success");
    load();
  };

  const columns = [
    { key: "title", header: "Title", sortable: true },
    { key: "author", header: "Author" },
    { key: "status", header: "Status", render: r => <StatusPill status={r.status} /> },
    { key: "published_at", header: "Published", render: r => r.published_at ? new Date(r.published_at).toLocaleDateString() : "—" },
  ];

  const pageSize = 20;

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Blogs | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Blogs</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setForm({ title: "", slug: "", excerpt: "", content: "", author: "", cover_image: "", tags: [], status: "draft", published_at: "" }); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> New Post
        </button>
      </div>

      <div className="admin-table-toolbar" style={{ marginBottom: 16 }}>
        <input type="text" placeholder="Search blogs..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        search={search}
        onSearch={setSearch}
        filterComponent={null}
        pageSize={pageSize}
        loading={loading}
        emptyIcon="fa-newspaper"
        emptyTitle="No posts yet"
        emptySubtitle="Click New Post to create your first blog entry"
        actions={r => [
          { icon: "fa-pen", label: "Edit", onClick: () => { setEditing(r); setForm({ ...r, tags: r.tags || [], cover_image: r.cover_image || "" }); setShowForm(true); } },
          { icon: "fa-copy", label: "Duplicate", onClick: () => duplicate(r) },
          ...(r.deleted_at
            ? [{ icon: "fa-rotate-left", label: "Restore", onClick: () => restore(r.id) }]
            : [{ icon: "fa-trash", label: "Delete", onClick: () => softDelete(r), color: "#e74c3c" }]),
        ]}
      />

      {showForm && (
        <div className="admin-dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, textAlign: "left", maxHeight: "90vh", overflowY: "auto" }}>
            <h3>{editing ? "Edit Post" : "New Post"}</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Title *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="admin-field"><label>Slug</label><input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} /></div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Author</label><input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} /></div>
                <div className="admin-field"><label>Status</label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option></select></div>
              </div>
              <div className="admin-field"><label>Excerpt</label><textarea rows={2} value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} /></div>
              <div className="admin-field"><label>Content</label><textarea rows={6} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
              <div className="admin-field"><label>Tags (comma-separated)</label><input value={(form.tags || []).join(", ")} onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} /></div>
              {form.status === "published" && <div className="admin-field"><label>Published At</label><input type="datetime-local" value={form.published_at ? form.published_at.slice(0, 16) : ""} onChange={e => setForm(p => ({ ...p, published_at: e.target.value ? new Date(e.target.value).toISOString() : "" }))} /></div>}
              <div className="admin-field"><label>Cover Image</label><ImageUploader bucket="blog-covers" value={form.cover_image ? [form.cover_image] : []} onChange={v => setForm(p => ({ ...p, cover_image: v[0] || "" }))} max={1} /></div>
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
        title="Delete Post"
        message={`Delete "${confirmDelete?.title}"? This is a soft delete and can be restored.`}
        onConfirm={confirmSoftDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Delete"
      />
    </>
  );
}
