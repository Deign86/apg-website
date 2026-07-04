import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import StatusPill from "@/components/admin/StatusPill";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { scoreLead } from "@/lib/insights";
import { aiLead } from "@/lib/ai";

const STATUSES = ["new", "contacted", "qualified", "won", "lost", "archived"];

export default function Leads() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("table");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(null);

  const load = useCallback(async () => {
    const [{ data: l }, { data: p }] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,email,full_name").eq("active", true),
    ]);
    const scored = (l || []).map(inq => ({ ...inq, _score: scoreLead(inq) }));
    setLeads(scored);
    setProfiles(p || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) return toast(error.message, "error");
    toast("Moved to " + status, "success");
    setLeads(p => p.map(l => l.id === id ? { ...l, status } : l));
    setSelected(p => p && p.id === id ? { ...p, status } : p);
  };

  const updateAssignee = async (id, assigned_to) => {
    await supabase.from("inquiries").update({ assigned_to: assigned_to || null }).eq("id", id);
    setLeads(p => p.map(l => l.id === id ? { ...l, assigned_to: assigned_to || null } : l));
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    const { error } = await supabase.from("inquiries").update({ notes }).eq("id", selected.id);
    if (error) return toast(error.message, "error");
    setLeads(p => p.map(l => l.id === selected.id ? { ...l, notes } : l));
    setSelected(p => p && p.id === selected.id ? { ...p, notes } : p);
    setSavingNotes(false);
    toast("Notes saved", "success");
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
    return (
      <>
        <Helmet><title>Leads | Alpha Premier Admin</title></Helmet>
        <div className="admin-page-header"><h1>Leads</h1></div>
        <EmptyState icon="fa-users" title="No leads yet" subtitle="Contact form submissions appear here with AI scores." />
      </>
    );
  }

  const counts = {};
  STATUSES.forEach(s => { counts[s] = leads.filter(l => l.status === s).length; });
  const filtered = filter ? leads.filter(l => l.status === filter) : leads;

  const openDetail = (lead) => {
    setSelected(lead);
    setNotes(lead.notes || "");
    setAiAnalysis(null);
  };

  return (
    <>
      <Helmet><title>Leads | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Leads ({leads.length})</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`admin-btn admin-btn-sm ${tab==="kanban"?"admin-btn-primary":"admin-btn-secondary"}`} onClick={() => setTab("kanban")}><i className="fa-solid fa-columns" /> Kanban</button>
          <button className={`admin-btn admin-btn-sm ${tab==="table"?"admin-btn-primary":"admin-btn-secondary"}`} onClick={() => setTab("table")}><i className="fa-solid fa-table" /> Table</button>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={exportCSV}><i className="fa-solid fa-download" /> CSV</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(f => f === s ? "" : s)} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid #2a2a2a", background: filter === s ? "#c5a059" : "transparent", color: filter === s ? "#000" : "#aaa", cursor: "pointer", fontSize: "0.8rem" }}>
            {s} ({counts[s] || 0})
          </button>
        ))}
        {filter && <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setFilter("")}>Clear</button>}
      </div>

      {tab === "table" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Source</th><th>Status</th><th>Score</th><th>Assigned</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id}>
                  <td><a href="#" onClick={e => { e.preventDefault(); openDetail(lead); }} style={{ color: "#c5a059" }}>{lead.name}</a></td>
                  <td>{lead.email}</td>
                  <td>{lead.source}</td>
                  <td><StatusPill status={lead.status} /></td>
                  <td><span className={`admin-pill admin-pill-${lead._score>=70?"green":lead._score>=40?"gold":"grey"}`}>{lead._score}</span></td>
                  <td>
                    <select value={lead.assigned_to||""} onChange={e => updateAssignee(lead.id, e.target.value)} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "2px 6px", fontSize: "0.75rem" }}>
                      <option value="">Unassigned</option>
                      {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openDetail(lead)} title="Open"><i className="fa-solid fa-arrow-right" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {STATUSES.filter(s => s !== "archived").map(s => {
            const items = leads.filter(l => l.status === s);
            if (!items.length && !filter) return null;
            return (
              <div key={s} style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, padding: 12, minHeight: 120 }}>
                <div style={{ fontSize: "0.8rem", color: "#c5a059", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{s} ({items.length})</div>
                {items.map(l => (
                  <div key={l.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #222", borderRadius: 6, padding: 8, marginBottom: 6, cursor: "pointer" }} onClick={() => openDetail(l)}>
                    <div style={{ fontSize: "0.85rem", color: "#eee", fontWeight: 500 }}>{l.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>{l.email}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Drawer */}
      {selected && (
        <div className="admin-dialog-overlay" onClick={() => setSelected(null)}>
          <div className="admin-dialog-box admin-drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: "left", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1rem" }}>{selected.name}</h3>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelected(null)}><i className="fa-solid fa-xmark" /></button>
            </div>

            <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: 8 }}>
              <div><strong>Email:</strong> <a href={`mailto:${selected.email}`} style={{ color: "#c5a059" }}>{selected.email}</a></div>
              {selected.phone && <div><strong>Phone:</strong> {selected.phone}</div>}
              {selected.subject && <div><strong>Subject:</strong> {selected.subject}</div>
              }
              {selected.message && <div><strong>Message:</strong><br /><p style={{ background: "#1a1a1a", padding: 8, borderRadius: 6, fontSize: "0.8rem", lineHeight: 1.5, margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{selected.message}</p></div>}

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: "0.85rem" }}>Score:</strong>
                <div style={{ flex: 1, height: 6, background: "#222", borderRadius: 3, overflow: "hidden", maxWidth: 120 }}>
                  <div style={{ width: `${selected._score}%`, height: "100%", background: selected._score >= 70 ? "#2ecc71" : selected._score >= 40 ? "#f39c12" : "#e74c3c" }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: selected._score >= 70 ? "#2ecc71" : selected._score >= 40 ? "#f39c12" : "#e74c3c" }}>{selected._score}</span>
              </div>

              <div><strong>Status:</strong>{" "}
                <select value={selected.status} onChange={e => { updateStatus(selected.id, e.target.value); setSelected(p => p && ({ ...p, status: e.target.value })); }} style={{ marginLeft: 8, background: "transparent", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "2px 8px", fontSize: "0.8rem" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div><strong>Assigned:</strong>{" "}
                <select value={selected.assigned_to || ""} onChange={e => updateAssignee(selected.id, e.target.value)} style={{ marginLeft: 8, background: "transparent", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "2px 8px", fontSize: "0.8rem" }}>
                  <option value="">Unassigned</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your Inquiry"}`} className="admin-btn admin-btn-primary admin-btn-sm" style={{ width: "fit-content", textDecoration: "none" }}><i className="fa-solid fa-reply" /> Reply</a>
              </div>

              <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 10, marginTop: 4 }}>
                <label style={{ fontSize: "0.8rem", color: "#aaa", display: "block", marginBottom: 4 }}>Notes</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes..." style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 6, padding: 8, fontSize: "0.85rem", resize: "vertical" }} />
                <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={saveNotes} disabled={savingNotes} style={{ marginTop: 6 }}>{savingNotes ? "Saving..." : "Save Notes"}</button>
              </div>

              <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 10, marginTop: 4, display: "flex", gap: 8 }}>
                <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }} onClick={() => { updateStatus(selected.id, "won"); setSelected(p => p && ({ ...p, status: "won" })); }}><i className="fa-solid fa-trophy" /> Mark Won</button>
                <button className="admin-btn admin-btn-danger admin-btn-sm" style={{ flex: 1 }} onClick={() => { updateStatus(selected.id, "lost"); setSelected(p => p && ({ ...p, status: "lost" })); }}><i className="fa-solid fa-xmark" /> Mark Lost</button>
              </div>

              <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 10, marginTop: 4 }}>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={async () => { setAiLoading(true); setAiAnalysis(null); const r = await aiLead(selected); if (r.summary) setAiAnalysis(r); else toast("AI analysis unavailable", "info"); setAiLoading(false); }} disabled={aiLoading} style={{ width: "100%" }}>
                  <i className={`fa-solid ${aiLoading ? "fa-spinner fa-spin" : "fa-brain"}`} /> {aiLoading ? "Analyzing..." : "AI Lead Analysis"}
                </button>

                {aiAnalysis && (
                  <div style={{ marginTop: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, padding: 12, fontSize: "0.85rem" }}>
                    <div style={{ color: "#e8d5a3", fontWeight: 600, fontSize: "0.75rem", letterSpacing: 1, marginBottom: 6 }}><i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }} />AI INSIGHT</div>
                    <div style={{ marginBottom: 6 }}><strong>Summary:</strong> {aiAnalysis.summary}</div>
                    <div style={{ marginBottom: 6 }}><strong>Next step:</strong> {aiAnalysis.nextAction}</div>
                    {aiAnalysis.suggestedReply && (
                      <div>
                        <strong>Suggested reply:</strong>
                        <p style={{ background: "#111", padding: 8, borderRadius: 4, fontSize: "0.8rem", lineHeight: 1.5, margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{aiAnalysis.suggestedReply}</p>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { navigator.clipboard.writeText(aiAnalysis.suggestedReply); toast("Copied", "success"); }} style={{ marginTop: 6 }}><i className="fa-solid fa-copy" /> Copy</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
