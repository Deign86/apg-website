import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import StatusPill from "@/components/admin/StatusPill";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";

export default function BlogManager() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title:"", slug:"", excerpt:"", content:"", category:"", cover_image:"", author:"", status:"draft" });

  const load = useCallback(async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const pay = { ...form };
    if (!pay.slug) pay.slug = pay.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    if (pay.status === "published" && !pay.published_at) pay.published_at = new Date().toISOString();
    const { error } = editing
      ? await supabase.from("blog_posts").update(pay).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(pay);
    if (error) return toast(error.message, "error");
    toast("Blog " + (editing ? "updated" : "created"), "success");
    setShowForm(false); setEditing(null); load();
  };

  const toggleStatus = async (r) => {
    const s = r.status === "published" ? "draft" : "published";
    await supabase.from("blog_posts").update({ status: s, published_at: s === "published" ? new Date().toISOString() : null }).eq("id", r.id);
    toast(s === "published" ? "Published" : "Unpublished", "success"); load();
  };

  const columns = [
    { key: "title", header: "Title" },
    { key: "category", header: "Category" },
    { key: "status", header: "Status", render: r => <StatusPill status={r.status} /> },
    { key: "created_at", header: "Created", render: r => new Date(r.created_at).toLocaleDateString() },
  ];

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Blogs | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Blogs</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setForm({title:"",slug:"",excerpt:"",content:"",category:"",cover_image:"",author:"",status:"draft"}); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> New Post
        </button>
      </div>

      {showForm && (
        <div className="admin-dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{maxWidth:600,textAlign:"left"}}>
            <h3>{editing ? "Edit Post" : "New Post"}</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Title *</label><input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} /></div>
              <div className="admin-field"><label>Slug</label><input value={form.slug} onChange={e => setForm(p=>({...p,slug:e.target.value}))} /></div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Category</label><input value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} /></div>
                <div className="admin-field"><label>Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select></div>
              </div>
              <div className="admin-field"><label>Author</label><input value={form.author} onChange={e => setForm(p=>({...p,author:e.target.value}))} /></div>
              <div className="admin-field"><label>Excerpt</label><textarea rows={2} value={form.excerpt} onChange={e => setForm(p=>({...p,excerpt:e.target.value}))} /></div>
              <div className="admin-field"><label>Content</label><textarea rows={6} value={form.content} onChange={e => setForm(p=>({...p,content:e.target.value}))} /></div>
              <div className="admin-field"><label>Cover Image</label><ImageUploader bucket="blog-images" value={form.cover_image ? [form.cover_image] : []} onChange={v => setForm(p=>({...p,cover_image:v[0]||""}))} max={1} /></div>
            </div>
            <div className="admin-dialog-actions" style={{marginTop:20}}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={!form.title}>Save</button>
            </div>
          </div>
        </div>
      )}

      <DataTable columns={columns} rows={rows} search={search} onSearch={setSearch} loading={false}
        emptyIcon="fa-newspaper" emptyTitle="No posts yet" emptySubtitle="Click New Post to create your first blog entry"
        actions={r => [
          { icon:"fa-pen", label:"Edit", onClick:() => { setEditing(r); setForm({...r}); setShowForm(true); }},
          { icon: r.status === "published" ? "fa-eye-slash" : "fa-eye", label: r.status === "published" ? "Unpublish" : "Publish", onClick:() => toggleStatus(r) },
        ]}
      />
    </>
  );
}
