import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";

const PAGE_SIZE = 50;

export default function ActivityLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(500).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  const uniqueActions = useMemo(() => [...new Set(rows.map(r => r.action))].sort(), [rows]);
  const uniqueUsers = useMemo(() => [...new Set(rows.map(r => r.user_email).filter(Boolean))].sort(), [rows]);

  const filtered = useMemo(() => {
    let data = rows;
    if (actionFilter) data = data.filter(r => r.action === actionFilter);
    if (userFilter) data = data.filter(r => r.user_email === userFilter);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      data = data.filter(r => new Date(r.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      data = data.filter(r => new Date(r.created_at) <= end);
    }
    return data;
  }, [rows, actionFilter, userFilter, startDate, endDate]);

  const columns = [
    {
      key: "created_at",
      header: "Timestamp",
      sortable: true,
      render: r => (
        <span style={{ whiteSpace: "nowrap" }}>
          {new Date(r.created_at).toLocaleString()}
        </span>
      ),
    },
    { key: "user_email", header: "Admin", render: r => r.user_email || <span style={{ color: "#666", fontStyle: "italic" }}>system</span> },
    {
      key: "action",
      header: "Action",
      render: r => {
        const actionMap = {
          create_blog: { icon: "fa-plus", color: "#2ecc71" },
          update_blog: { icon: "fa-pen", color: "#3498db" },
          delete_blog: { icon: "fa-trash", color: "#e74c3c" },
          restore_blog: { icon: "fa-rotate-left", color: "#f39c12" },
          duplicate_blog: { icon: "fa-copy", color: "#9b59b6" },
          create_career: { icon: "fa-plus", color: "#2ecc71" },
          update_career: { icon: "fa-pen", color: "#3498db" },
          delete_career: { icon: "fa-trash", color: "#e74c3c" },
          create_chatbot_kb: { icon: "fa-plus", color: "#2ecc71" },
          update_chatbot_kb: { icon: "fa-pen", color: "#3498db" },
          delete_chatbot_kb: { icon: "fa-trash", color: "#e74c3c" },
          activate_chatbot_kb: { icon: "fa-play", color: "#2ecc71" },
          deactivate_chatbot_kb: { icon: "fa-pause", color: "#f39c12" },
          bulk_import_chatbot_kb: { icon: "fa-file-import", color: "#3498db" },
          invite_user: { icon: "fa-user-plus", color: "#2ecc71" },
          activate_user: { icon: "fa-check", color: "#2ecc71" },
          deactivate_user: { icon: "fa-ban", color: "#e74c3c" },
          update_user_role: { icon: "fa-shield-halved", color: "#9b59b6" },
          update_settings: { icon: "fa-gear", color: "#3498db" },
        };
        const meta = actionMap[r.action] || { icon: "fa-circle-info", color: "#888" };
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color, fontSize: "0.75rem" }} />
            <span>{r.action}</span>
          </span>
        );
      },
    },
    { key: "resource_type", header: "Type", render: r => r.resource_type || "—" },
    { key: "resource_title", header: "Resource", render: r => r.resource_title ? <span style={{ color: "#ccc" }}>{r.resource_title}</span> : "—" },
    { key: "details", header: "Details", render: r => r.details ? <span style={{ color: "#999", fontSize: "0.8rem" }}>{r.details}</span> : "—" },
  ];

  const paged = useMemo(() => filtered.slice(0, PAGE_SIZE), [filtered]);

  const filterComponent = (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "4px 10px", fontSize: "0.8rem", minWidth: 140 }}>
        <option value="">All actions</option>
        {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "4px 10px", fontSize: "0.8rem", minWidth: 160 }}>
        <option value="">All users</option>
        {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "4px 8px", fontSize: "0.8rem" }} />
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "4px 8px", fontSize: "0.8rem" }} />
      {(actionFilter || userFilter || startDate || endDate) && (
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setActionFilter(""); setUserFilter(""); setStartDate(""); setEndDate(""); }}>Clear</button>
      )}
    </div>
  );

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Activity Log | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header"><h1>Activity Log</h1></div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, fontSize: "0.8rem", color: "#888" }}>
        {filtered.length > PAGE_SIZE && `Showing latest ${PAGE_SIZE} of ${filtered.length} results`}
      </div>

      <DataTable
        columns={columns}
        rows={paged}
        loading={loading}
        emptyIcon="fa-clock-rotate-left"
        emptyTitle="No activity yet"
        emptySubtitle="Admin actions will appear here"
        filterComponent={filterComponent}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
