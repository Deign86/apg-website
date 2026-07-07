import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { logActivity } from "@/lib/logActivity";

const PAGE_SIZE = 25;

export default function ChatbotTrainer() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [aiStatus, setAiStatus] = useState(null); // { nvidiaConfigured, model, supabase } or null

  const load = useCallback(async () => {
    let q = supabase.from("chat_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (roleFilter) q = q.eq("role", roleFilter);
    if (sessionFilter) q = q.eq("session_id", sessionFilter);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      q = q.gte("created_at", start.toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      q = q.lte("created_at", end.toISOString());
    }
    const { data } = await q.limit(500);
    setLogs(data || []);
    setLoading(false);
  }, [roleFilter, sessionFilter, startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  // Fetch AI health on mount
  useEffect(() => {
    fetch('/api/ai/health')
      .then(r => r.json())
      .then(setAiStatus)
      .catch(() => setAiStatus(null));
  }, []);

  const uniqueSessions = useMemo(() => [...new Set(logs.map(l => l.session_id).filter(Boolean))].slice(0, 50), [logs]);

  const filtered = useMemo(() => {
    let data = logs;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(l => (l.content || "").toLowerCase().includes(q) || (l.user_identifier || "").toLowerCase().includes(q));
    }
    return data;
  }, [logs, search]);

  const sessionsMap = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      if (!l.session_id) return;
      if (!map[l.session_id]) map[l.session_id] = { count: 0, lastAt: l.created_at, user: l.user_identifier };
      map[l.session_id].count++;
      if (new Date(l.created_at) > new Date(map[l.session_id].lastAt)) map[l.session_id].lastAt = l.created_at;
    });
    return map;
  }, [logs]);

  const sessionLogs = useMemo(() => {
    if (!selectedSession) return [];
    return logs.filter(l => l.session_id === selectedSession).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [logs, selectedSession]);

  const clearLogs = async () => {
    const { error } = await supabase.from("chat_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return toast(error.message, "error");
    await logActivity({ action: "clear_chat_logs", resourceType: "chat_logs", resourceId: null, resourceTitle: "", details: "Cleared chat logs" });
    toast("Chat logs cleared", "success");
    setConfirmClear(false);
    setSelectedSession(null);
    load();
  };

  const exportCSV = () => {
    const h = "Timestamp,Session,User,Role,Content,Model\n";
    const r = filtered.map(l => `"${l.created_at}","${l.session_id||''}","${(l.user_identifier||'').replace(/"/g,'""')}","${l.role}","${(l.content||'').replace(/"/g,'""').replace(/\n/g,' ')}","${l.model||''}"`).join('\n');
    const b = new Blob([h+r], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "chat-logs-" + new Date().toISOString().slice(0,10) + ".csv";
    a.click();
  };

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Chat Logs | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Chat Logs</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="admin-btn admin-btn-secondary" onClick={exportCSV}><i className="fa-solid fa-download" /> Export CSV</button>
          <button className="admin-btn admin-btn-danger" onClick={() => setConfirmClear(true)}><i className="fa-solid fa-trash" /> Clear Logs</button>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16, padding: 12, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: "0.85rem", color: "#aaa" }}>
          <strong style={{ color: "#c5a059" }}>{logs.length}</strong> total messages &nbsp;|&nbsp;
          <strong style={{ color: "#c5a059" }}>{Object.keys(sessionsMap).length}</strong> sessions
        </div>
        {aiStatus && (
          <span
            className={`admin-pill admin-pill-${aiStatus.nvidiaConfigured ? "gold" : "muted"}`}
            style={{ fontSize: "0.75rem", cursor: "default" }}
            title={`NVIDIA: ${aiStatus.nvidiaConfigured ? "key present" : "not configured"} | Model: ${aiStatus.model} | Supabase: ${aiStatus.supabase ? "ok" : "no"}`}
          >
            <i className={`fa-solid fa-${aiStatus.nvidiaConfigured ? "check-circle" : "circle-exclamation"}`} style={{ marginRight: 4 }} />
            AI {aiStatus.nvidiaConfigured ? "Connected" : "Disconnected"}
          </span>
        )}
        {selectedSession && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelectedSession(null)}>
            <i className="fa-solid fa-xmark" /> Clear session view
          </button>
        )}
      </div>

      {selectedSession ? (
        /* Session Detail View */
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#fff" }}>
              Session: <span style={{ color: "#c5a059", fontFamily: "monospace", fontSize: "0.85rem" }}>{selectedSession}</span>
              <span style={{ color: "#888", fontSize: "0.8rem", marginLeft: 8 }}>({sessionLogs.length} messages, user: {sessionLogs[0]?.user_identifier || "visitor"})</span>
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#666" }}>{sessionLogs[0]?.created_at ? new Date(sessionLogs[0].created_at).toLocaleString() : ""}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto", padding: "8px 0" }}>
            {sessionLogs.map((log, i) => (
              <div key={log.id || i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 70, textAlign: "right", fontSize: "0.7rem", color: "#555", paddingTop: 6 }}>
                  {log.role === "user" ? "Visitor" : "Alpha"}
                </div>
                <div style={{
                  flex: 1,
                  maxWidth: "75%",
                  background: log.role === "user" ? "#1a1a1a" : "rgba(197,160,89,0.08)",
                  border: `1px solid ${log.role === "user" ? "#222" : "rgba(197,160,89,0.2)"}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  color: "#ddd",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {log.content}
                </div>
                <span style={{ fontSize: "0.65rem", color: "#444", flexShrink: 0, paddingTop: 6 }}>
                  {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="admin-table-toolbar" style={{ marginBottom: 16 }}>
          <input type="text" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
          </select>
          <select value={sessionFilter} onChange={e => setSessionFilter(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">All sessions</option>
            {uniqueSessions.map(s => <option key={s} value={s}>{s} ({sessionsMap[s]?.count || 0} msgs)</option>)}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ minWidth: 140 }} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ minWidth: 140 }} />
          {(roleFilter || sessionFilter || startDate || endDate) && (
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setRoleFilter(""); setSessionFilter(""); setStartDate(""); setEndDate(""); }}>Clear</button>
          )}
        </div>
      )}

      {!selectedSession && (
        <DataTable
          columns={[
            {
              key: "created_at", header: "Time", sortable: true, render: r => (
                <span style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>{new Date(r.created_at).toLocaleString()}</span>
              ),
            },
            {
              key: "role", header: "Role", render: r => (
                <span className={`admin-pill admin-pill-${r.role === "user" ? "blue" : "gold"}`}>{r.role}</span>
              ),
            },
            { key: "user_identifier", header: "Visitor", render: r => <span style={{ fontSize: "0.8rem", color: "#aaa" }}>{r.user_identifier || "unknown"}</span> },
            {
              key: "content", header: "Message", render: r => (
                <span style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", fontSize: "0.85rem", color: "#ccc" }}>
                  {r.content}
                </span>
              ),
            },
            {
              key: "session_id", header: "Session", render: r => r.session_id ? (
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelectedSession(r.session_id)} style={{ fontSize: "0.7rem", fontFamily: "monospace" }}>
                  {r.session_id.slice(0, 12)}...
                </button>
              ) : "—",
            },
          ]}
          rows={filtered}
          search={search}
          onSearch={setSearch}
          pageSize={PAGE_SIZE}
          loading={loading}
          emptyIcon="fa-comments"
          emptyTitle="No chat logs"
          emptySubtitle="Chatbot conversations will appear here"
          actions={r => r.session_id ? [
            { icon: "fa-comments", label: "View session", onClick: () => setSelectedSession(r.session_id) },
          ] : []}
        />
      )}

      <ConfirmDialog
        open={!!confirmClear}
        title="Clear All Chat Logs"
        message="This will permanently delete all chat history. This cannot be undone."
        onConfirm={clearLogs}
        onCancel={() => setConfirmClear(false)}
        confirmLabel="Clear All"
      />
    </>
  );
}
