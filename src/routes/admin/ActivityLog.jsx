import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/admin/DataTable";

export default function ActivityLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    Promise.all([
      supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("id,email,full_name"),
    ]).then(([log, pr]) => {
      const pmap = {};
      (pr.data||[]).forEach(p => { pmap[p.id] = p.full_name || p.email; });
      setProfiles(pmap);
      setRows(log.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = filter ? rows.filter(r => r.action?.includes(filter) || r.entity?.includes(filter)) : rows;

  const columns = [
    { key: "created_at", header: "Time", render: r => new Date(r.created_at).toLocaleString() },
    { key: "user_id", header: "User", render: r => profiles[r.user_id] || r.user_id?.substring(0,8) || "system" },
    { key: "action", header: "Action" },
    { key: "entity", header: "Entity" },
    { key: "entity_id", header: "Entity ID", render: r => r.entity_id?.substring(0,12) || "—" },
  ];

  return (
    <>
      <Helmet><title>Activity Log | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header"><h1>Activity Log</h1></div>
      <DataTable columns={columns} rows={filtered} loading={loading}
        emptyIcon="fa-clock-rotate" emptyTitle="No activity yet" emptySubtitle="Admin actions will be logged here"
        search={filter} onSearch={setFilter}
      />
    </>
  );
}
