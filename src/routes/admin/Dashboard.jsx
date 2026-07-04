import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import { aiInsights } from '@/lib/ai';
import { generateDashboardInsights } from '@/lib/insights';
import StatCard from '@/components/admin/StatCard';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#3498db', '#f39c12', '#2ecc71', '#e74c3c', '#95a5a6', '#9b59b6'];

export default function Dashboard() {
  const [stats, setStats] = useState({ listings: 0, leads: 0, pipeline: 0, wins: 0 });
  const [state, setState] = useState(null);
  const [insights, setInsights] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const refreshInsights = useCallback(async (dataState) => {
    const s = dataState || state;
    if (!s) return;
    setAiLoading(true);
    setInsights(generateDashboardInsights(s));
    const result = await aiInsights(s);
    if (result.narrative) setNarrative(result.narrative);
    else setNarrative('');
    setAiLoading(false);
  }, [state]);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: properties }, { data: leads }] = await Promise.all([
          supabase
            .from('offerings')
            .select('title,location,property_type,price,price_unit,status,updated_at,created_at,featured')
            .eq('is_published', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),
          supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        ]);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const newLeads = (leads || []).filter(l => new Date(l.created_at) >= monthAgo).length;
        const qualifiedIds = (leads || []).filter(l => l.status === 'qualified' && l.property_id).map(l => l.property_id);
        const wonCount = (leads || []).filter(l => l.status === 'won').length;
        setStats({
          listings: (properties || []).length,
          leads: newLeads,
          pipeline: qualifiedIds.length,
          wins: wonCount,
        });
        const dataState = { properties: properties || [], inquiries: leads || [] };
        setState(dataState);
        refreshInsights(dataState);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [refreshInsights]);

  const leadTrend = state?.inquiries
    ? Object.entries(
        state.inquiries.reduce((acc, l) => {
          const day = (l.created_at || '').slice(0, 10);
          if (day) acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, count]) => ({ date, count }))
    : [];

  const leadStatus = state?.inquiries
    ? Object.entries(
        state.inquiries.reduce((acc, l) => {
          acc[l.status] = (acc[l.status] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Dashboard | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header"><h1>Dashboard</h1></div>

      <div className="admin-stats-grid">
        <StatCard icon="fa-building" label="Active Listings" value={stats.listings} />
        <StatCard icon="fa-users" label="New Leads (30d)" value={stats.leads} />
        <StatCard icon="fa-arrow-trend-up" label="Active Pipeline" value={stats.pipeline} />
        <StatCard icon="fa-trophy" label="Closed Won" value={stats.wins} />
      </div>

      {/* AI Narrative */}
      {narrative && (
        <div className="admin-card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0, color: '#c5a059', fontSize: '0.85rem', fontFamily: 'Orbitron, sans-serif' }}>
              <i className="fa-solid fa-brain" style={{ marginRight: 8 }} />AI Analysis
            </h3>
            <button
              className="admin-btn admin-btn-sm admin-btn-ghost"
              onClick={() => refreshInsights()}
              disabled={aiLoading}
              style={{ fontSize: '0.75rem' }}
            >
              <i className={`fa-solid ${aiLoading ? 'fa-spinner fa-spin' : 'fa-rotate'}`} style={{ marginRight: 4 }} />
              {aiLoading ? 'Analyzing...' : 'Regenerate'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', lineHeight: 1.6 }}>{narrative}</p>
        </div>
      )}

      {/* Heuristic Insight Cards */}
      {insights.length > 0 && (
        <div className="admin-card-grid" style={{ marginBottom: 24 }}>
          {insights.map(ins => (
            <div key={ins.id} className="admin-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <i
                  className={`fa-solid ${ins.icon}`}
                  style={{
                    fontSize: '1.5rem',
                    color: ins.severity === 'warn' ? '#f39c12' : ins.severity === 'good' ? '#2ecc71' : '#3498db',
                    marginTop: 2,
                  }}
                />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#eee' }}>{ins.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>{ins.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {leadTrend.length > 1 && (
        <div className="admin-card-grid">
          <div className="admin-card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#c5a059' }}>Leads Over Time (14 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={leadTrend}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="count" stroke="#c5a059" fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {leadStatus.length > 1 && (
            <div className="admin-card" style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#c5a059' }}>Lead Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={leadStatus}
                    cx="50%" cy="50%" outerRadius={70}
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={{ stroke: '#555' }}
                    dataKey="value"
                  >
                    {leadStatus.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </>
  );
}
