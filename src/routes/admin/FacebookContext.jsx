import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { logActivity } from "@/lib/logActivity";

const PAGE_SIZE = 25;

export default function FacebookContext() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("facebook_context")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editItem.title.trim() || !editItem.summary.trim()) {
      return toast("Title and summary are required.", "error");
    }
    const record = {
      title: editItem.title.trim(),
      summary: editItem.summary.trim(),
      post_url: editItem.post_url || null,
      active: editItem.active !== false,
    };
    if (editItem.id) {
      const { error } = await supabase.from("facebook_context").update(record).eq("id", editItem.id);
      if (error) return toast(error.message, "error");
      await logActivity({ action: "update_facebook_context", resourceType: "facebook_context", resourceId: editItem.id, resourceTitle: record.title, details: "" });
      toast("Facebook entry updated.", "success");
    } else {
      const { error } = await supabase.from("facebook_context").insert(record);
      if (error) return toast(error.message, "error");
      toast("Facebook entry added.", "success");
    }
    setEditItem(null);
    load();
  };

  const remove = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("facebook_context").delete().eq("id", confirmDelete.id);
    if (error) return toast(error.message, "error");
    await logActivity({ action: "delete_facebook_context", resourceType: "facebook_context", resourceId: confirmDelete.id, resourceTitle: confirmDelete.title, details: "" });
    toast("Facebook entry deleted.", "success");
    setConfirmDelete(null);
    load();
  };


  return (
    <>
      <Helmet><title>Facebook Context — Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Facebook Context</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => setEditItem({ title: "", summary: "", post_url: "", active: true })}>
          <i className="fa-solid fa-plus" /> Add Post Summary
        </button>
      </div>

      {editItem && (
        <div className="admin-card" style={{ maxWidth: 700, marginBottom: 24 }}>
          <h3>{editItem.id ? "Edit" : "Add"} Facebook Post Summary</h3>
          <div className="admin-form" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            <input type="text" placeholder="Title" value={editItem.title} onChange={e => setEditItem({ ...editItem, title: e.target.value })} />
            <textarea placeholder="Summary of the Facebook post content..." rows={4} value={editItem.summary} onChange={e => setEditItem({ ...editItem, summary: e.target.value })} />
            <input type="url" placeholder="Post URL (optional)" value={editItem.post_url || ""} onChange={e => setEditItem({ ...editItem, post_url: e.target.value })} />
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={editItem.active !== false} onChange={e => setEditItem({ ...editItem, active: e.target.checked })} />
              Active
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="admin-btn admin-btn-primary" onClick={save}>
                <i className="fa-solid fa-floppy-disk" /> {editItem.id ? "Update" : "Add"}
              </button>
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 && !loading ? (
        <EmptyState icon="fa-facebook" title="No Facebook context yet" subtitle="Add approved Facebook post summaries here." />
      ) : (
        <DataTable
          columns={[
            { key: "created_at", header: "Date", sortable: true, render: r => <span style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>{new Date(r.created_at).toLocaleDateString()}</span> },
            { key: "title", header: "Title", render: r => <strong>{r.title}</strong> },
            { key: "summary", header: "Summary", render: r => <span style={{ maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", fontSize: "0.85rem", color: "#ccc" }}>{r.summary}</span> },
            { key: "active", header: "Active", render: r => <span className={`admin-pill ${r.active ? "admin-pill-green" : "admin-pill-grey"}`}>{r.active ? "Yes" : "No"}</span> },
          ]}
          rows={items}
          search=""
          pageSize={PAGE_SIZE}
          loading={loading}
          emptyIcon="fa-facebook"
          emptyTitle="No Facebook context"
          emptySubtitle="Add approved Facebook post summaries here"
          actions={r => [
            { icon: "fa-pen", label: "Edit", onClick: () => setEditItem({ id: r.id, title: r.title, summary: r.summary, post_url: r.post_url, active: r.active }) },
            { icon: "fa-trash", label: "Delete", onClick: () => setConfirmDelete(r) },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Facebook Entry"
        message={`Delete "${confirmDelete?.title || ""}"? This cannot be undone.`}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Delete"
      />
    </>
  );
}
