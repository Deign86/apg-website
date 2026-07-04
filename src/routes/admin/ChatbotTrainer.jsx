import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import { useToast } from "@/components/admin/Toast";
import { aiChat } from "@/lib/ai";

export default function ChatbotTrainer() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState("");
  const [useAiTest, setUseAiTest] = useState(false);
  const [aiTestLoading, setAiTestLoading] = useState(false);
  const [form, setForm] = useState({ trigger:"", answer:"", keywords:"", priority:0, active:true });

  const load = useCallback(async () => {
    const { data } = await supabase.from("chatbot_kb").select("*").order("priority", { ascending: false });
    setRows(data || []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const { error } = editing
      ? await supabase.from("chatbot_kb").update(form).eq("id", editing.id)
      : await supabase.from("chatbot_kb").insert(form);
    if (error) return toast(error.message, "error");
    toast("KB " + (editing ? "updated" : "created"), "success");
    setShowForm(false); setEditing(null); load();
  };

  const testMatch = async () => {
    const q = testInput.toLowerCase();
    if (useAiTest) {
      setAiTestLoading(true);
      setTestResult("");
      const result = await aiChat(testInput);
      setTestResult(result.content ? "AI says: " + result.content : "AI unavailable — " + (result.message || "fallback"));
      setAiTestLoading(false);
    } else {
      const found = rows.filter(r => r.active).find(r => {
        const triggers = (r.trigger||"").split(",").map(t => t.trim().toLowerCase());
        return triggers.some(t => q.includes(t));
      });
      setTestResult(found ? found.answer : "No match — will use fallback response");
    }
  };

  const columns = [
    { key: "trigger", header: "Trigger" },
    { key: "answer", header: "Answer", render: r => (r.answer||"").substring(0,60) + "..." },
    { key: "priority", header: "Priority" },
    { key: "active", header: "Active", render: r => r.active ? <i className="fa-solid fa-check" style={{color:"#2ecc71"}} /> : <i className="fa-solid fa-xmark" style={{color:"#e74c3c"}} /> },
  ];

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Chatbot | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Chatbot Trainer</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setForm({trigger:"",answer:"",keywords:"",priority:0,active:true}); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> New Intent
        </button>
      </div>

      {showForm && (
        <div className="admin-dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{maxWidth:500,textAlign:"left"}}>
            <h3>{editing ? "Edit Intent" : "New Intent"}</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Trigger words * (comma separated)</label><input value={form.trigger} onChange={e => setForm(p=>({...p,trigger:e.target.value}))} /></div>
              <div className="admin-field"><label>Answer *</label><textarea rows={3} value={form.answer} onChange={e => setForm(p=>({...p,answer:e.target.value}))} /></div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Keywords (for matching)</label><input value={form.keywords} onChange={e => setForm(p=>({...p,keywords:e.target.value}))} /></div>
                <div className="admin-field"><label>Priority</label><input type="number" value={form.priority} onChange={e => setForm(p=>({...p,priority:parseInt(e.target.value)||0}))} /></div>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.85rem",color:"#aaa"}}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(p=>({...p,active:e.target.checked}))} /> Active
              </label>
            </div>
            <div className="admin-dialog-actions" style={{marginTop:20}}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={!form.trigger||!form.answer}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card" style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <label style={{fontSize:"0.8rem",color:"#aaa",display:"block"}}>Test a message</label>
          <label style={{fontSize:"0.75rem",color:"#888",display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
            <input type="checkbox" checked={useAiTest} onChange={e => setUseAiTest(e.target.checked)} /> AI response
          </label>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="Type a message to test..." style={{flex:1,background:"var(--admin-surface-2)",border:"1px solid var(--admin-border)",color:"#eee",padding:"8px 12px",borderRadius:6}} />
          <button className="admin-btn admin-btn-primary" onClick={testMatch} disabled={aiTestLoading}>
            <i className={`fa-solid ${aiTestLoading ? "fa-spinner fa-spin" : "fa-flask"}`} /> {aiTestLoading ? "..." : "Test"}
          </button>
        </div>
        {testResult && <p style={{margin:"8px 0 0",fontSize:"0.85rem",color:testResult.includes("No match")||testResult.includes("unavailable")?"#e74c3c":"#2ecc71"}}>{testResult}</p>}
      </div>

      <DataTable columns={columns} rows={rows} search={search} onSearch={setSearch} loading={false}
        emptyIcon="fa-robot" emptyTitle="No intents yet" emptySubtitle="Add intents to train the chatbot"
        actions={r => [
          { icon:"fa-pen", label:"Edit", onClick:() => { setEditing(r); setForm({...r}); setShowForm(true); }},
          { icon: r.active ? "fa-pause" : "fa-play", label: r.active ? "Deactivate" : "Activate", onClick:async () => { await supabase.from("chatbot_kb").update({active:!r.active}).eq("id",r.id); toast(r.active?"Deactivated":"Activated","success"); load(); }},
        ]}
      />
    </>
  );
}
