import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import StatusPill from "@/components/admin/StatusPill";
import EmptyState from "@/components/admin/EmptyState";
import { useToast } from "@/components/admin/Toast";
import { scoreLead } from "@/lib/insights";
import { aiLead } from "@/lib/ai";

const STATUSES = ["new","contacted","qualified","won","lost","archived"];

export default function Leads() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("kanban");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async () => {
    const [{ data: l }, { data: p }] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,email,full_name").eq("active", true),
    ]);
    setLeads((l||[]).map(inq => ({ ...inq, _score: scoreLead(inq) })));
    setProfiles(p || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Moved to " + status, "success");
    load();
  };

  const updateAssignee = async (id, assigned_to) => {
    await supabase.from("inquiries").update({ assigned_to: assigned_to || null }).eq("id", id);
    load();
  };

  const exportCSV = () => {
    const f = filter ? leads.filter(l => l.status === filter) : leads;
    const h = "Ticket,Name,Email,Phone,Subject,Message,Source,Status,Score,Created\n";
    const r = f.map(l => `"${l.ticket||''}","${(l.name||'').replace(/"/g,'""')}","${l.email}","${l.phone||''}","${(l.subject||'').replace(/"/g,'""')}","${(l.message||'').replace(/"/g,'""').replace(/\n/g,' ')}","${l.source}","${l.status}","${l._score}","${l.created_at}"`).join('\n');
    const b = new Blob([h+r], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "leads-" + new Date().toISOString().slice(0,10) + ".csv";
    a.click();
  };

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;
  if (leads.length === 0) {
    return <><Helmet><title>Leads | Alpha Premier Admin</title></Helmet><div className="admin-page-header"><h1>Leads</h1></div><EmptyState icon="fa-users" title="No leads yet" subtitle="Contact form submissions appear here with AI scores." /></>;
  }

  const counts = {};
  STATUSES.forEach(s => { counts[s] = leads.filter(l => l.status === s).length; });
  const filtered = filter ? leads.filter(l => l.status === filter) : leads;

  return (
    <>
      <Helmet><title>Leads | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header"><h1>Leads ({leads.length})</h1>
        <div style={{display:"flex",gap:8}}>
          <button className={`admin-btn admin-btn-sm ${tab==="kanban"?"admin-btn-primary":"admin-btn-secondary"}`} onClick={() => setTab("kanban")}><i className="fa-solid fa-columns" /> Kanban</button>
          <button className={`admin-btn admin-btn-sm ${tab==="table"?"admin-btn-primary":"admin-btn-secondary"}`} onClick={() => setTab("table")}><i className="fa-solid fa-table" /> Table</button>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={exportCSV}><i className="fa-solid fa-download" /> CSV</button>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(f => f === s ? "" : s)}
            style={{padding:"4px 12px",borderRadius:20,border:"1px solid #2a2a2a",background:filter===s?"#c5a059":"transparent",color:filter===s?"#000":"#aaa",cursor:"pointer",fontSize:"0.8rem"}}>
            {s} ({counts[s]||0})
          </button>
        ))}
        {filter && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setFilter("")}>Clear</button>}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Source</th><th>Status</th><th>Score</th><th>Assigned</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id}>
                <td><a href="#" onClick={e => { e.preventDefault(); setSelected(lead); setAiAnalysis(null); }} style={{color:"#c5a059"}}>{lead.name}</a></td>
                <td>{lead.email}</td><td>{lead.source}</td>
                <td><StatusPill status={lead.status} /></td>
                <td><span className={`admin-pill admin-pill-${lead._score>=70?"gold":lead._score>=40?"blue":"grey"}`}>{lead._score}</span></td>
                <td><select value={lead.assigned_to||""} onChange={e => updateAssignee(lead.id, e.target.value)} style={{background:"transparent",border:"1px solid #2a2a2a",color:"#eee",borderRadius:4,padding:"2px 6px",fontSize:"0.75rem"}}>
                  <option value="">Unassigned</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name||p.email}</option>)}
                </select></td>
                <td style={{fontSize:"0.75rem",color:"#888"}}>{new Date(lead.created_at).toLocaleDateString()}</td>
                <td><select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                  style={{background:"transparent",border:"1px solid #2a2a2a",color:"#eee",borderRadius:4,padding:"2px 6px",fontSize:"0.75rem"}}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-dialog-overlay" onClick={() => setSelected(null)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{maxWidth:500,textAlign:"left"}}>
            <h3>{selected.name}</h3>
            <div style={{fontSize:"0.85rem",display:"flex",flexDirection:"column",gap:8}}>
              <div><strong>Email:</strong> <a href={`mailto:${selected.email}`} style={{color:"#c5a059"}}>{selected.email}</a></div>
              {selected.phone && <div><strong>Phone:</strong> {selected.phone}</div>}
              {selected.subject && <div><strong>Subject:</strong> {selected.subject}</div>}
              {selected.message && <div><strong>Message:</strong><br/>{selected.message}</div>}
              <div><strong>Score:</strong> <span className={`admin-pill admin-pill-${selected._score>=70?"gold":selected._score>=40?"blue":"grey"}`}>{selected._score}</span></div>
              <div><strong>Status:</strong> <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} style={{marginLeft:8}}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><strong>Assigned:</strong> <select value={selected.assigned_to||""} onChange={e => updateAssignee(selected.id, e.target.value)} style={{marginLeft:8}}>
                <option value="">Unassigned</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.full_name||p.email}</option>)}
              </select></div>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject||"Your Inquiry"}`} className="admin-btn admin-btn-primary admin-btn-sm" style={{width:"fit-content"}}><i className="fa-solid fa-reply" /> Reply</a>
              <button className="admin-btn admin-btn-sm admin-btn-ghost" onClick={async () => { setAiLoading(true); setAiAnalysis(null); const r = await aiLead(selected); if (r.summary) setAiAnalysis(r); else toast("AI analysis unavailable", "info"); setAiLoading(false); }} disabled={aiLoading} style={{width:"fit-content",marginTop:4}}>
                <i className={`fa-solid ${aiLoading ? "fa-spinner fa-spin" : "fa-brain"}`} /> {aiLoading ? "Analyzing..." : "AI Analysis"}
              </button>
            </div>
            {aiAnalysis && (
              <div style={{marginTop:12,borderTop:"1px solid #2a2a2a",paddingTop:12,fontSize:"0.85rem",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{color:"#e8d5a3",fontWeight:600,fontSize:"0.75rem",letterSpacing:1}}><i className="fa-solid fa-wand-magic-sparkles" style={{marginRight:6}} />AI INSIGHT</div>
                <div><strong>Summary:</strong> {aiAnalysis.summary}</div>
                <div><strong>Next step:</strong> {aiAnalysis.nextAction}</div>
                {aiAnalysis.suggestedReply && <div><strong>Suggested reply:</strong><br/><p style={{background:"var(--admin-surface-2)",padding:8,borderRadius:6,fontSize:"0.8rem",lineHeight:1.5,margin:"4px 0 0"}}>{aiAnalysis.suggestedReply}</p></div>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
