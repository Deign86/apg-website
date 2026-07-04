import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import { aiInsights } from '@/lib/ai';
import { generateDashboardInsights, scoreLead } from '@/lib/insights';
import { logActivity } from '@/lib/logActivity';
import StatCard from '@/components/admin/StatCard';
import StatusPill from '@/components/admin/StatusPill';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { useToast } from '@/components/admin/Toast';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const PIE_COLORS = ['#3498db', '#f39c12', '#2ecc71', '#e74c3c', '#95a5a6', '#9b59b6'];
const GOLD = '#c5a059';
const BG = '#0a0a0a';
const SURFACE = '#111';
const BORDER = '#2a2a2a';

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({ listings: 0, leads: 0, pipeline: 0, wins: 0 });
  const [state, setState] = useState(null);
  const [insights, setInsights] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

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
        const [{ data: properties }, { data: leads }, { data: activityRows }] = await Promise.all([
          supabase
            .from('offerings')
            .select('title,location,property_type,price,price_unit,status,updated_at,created_at,featured')
            .eq('is_published', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false }),
          supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
          supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10),
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
        setActivity(activityRows || []);
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
        .slice(-30)
        .map(([date, count]) => ({ date, count }))
    : [];

  const listingsByType = state?.properties
    ? Object.entries(
        state.properties.reduce((acc, p) => {
          const type = p.property_type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([name, value]) => ({ name, value }))
    : [];

  const leadStatus = state?.inquiries
    ? Object.entries(
        state.inquiries.reduce((acc, l) => {
          acc[l.status] = (acc[l.status] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([name, value]) => ({ name, value }))
    : [];

  const hotLeads = state?.inquiries
    ? [...state.inquiries]
        .map(l => ({ ...l, _score: scoreLead(l) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 3)
    : [];

  const scoreColor = (s) => s >= 70 ? '#2ecc71' : s >= 40 ? '#f39c12' : '#e74c3c';

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const actionIcon = (action) => {
    const a = (action || '').toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'fa-plus';
    if (a.includes('update') || a.includes('edit')) return 'fa-pen';
    if (a.includes('delete') || a.includes('remove')) return 'fa-trash';
    if (a.includes('login')) return 'fa-right-to-bracket';
    return 'fa-circle-info';
  };

  if (loading) return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;

  return (
    <>
      <Helmet><title>Dashboard | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header"><h1>Dashboard</h1></div>

      {/* KPI Cards */}
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
            <h3 style={{ margin: 0, color: GOLD, fontSize: '0.85rem', fontFamily: 'Orbitron, sans-serif' }}>
              <i className="fa-solid fa-brain" style={{ marginRight: 8 }} />
              AI Analysis
            </h3>
            <button className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => refreshInsights()} disabled={aiLoading} style={{ fontSize: '0.75rem' }}>
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
            <div key={ins.id} className="admin-card" style={{ padding: 16, borderLeft: `3px solid ${ins.severity === 'warn' ? '#f39c12' : ins.severity === 'good' ? '#2ecc71' : '#3498db'}` }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <i className={`fa-solid ${ins.icon}`} style={{ fontSize: '1.5rem', color: ins.severity === 'warn' ? '#f39c12' : ins.severity === 'good' ? '#2ecc71' : '#3498db', marginTop: 2 }} />
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
      <div className="admin-card-grid" style={{ marginBottom: 24 }}>
        {/* Line Chart: inquiries per day (30 days) */}
        <div className="admin-card" style={{ padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: GOLD }}>Inquiries (30 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={leadTrend}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="count" stroke={GOLD} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: listings by property_type */}
        <div className="admin-card" style={{ padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: GOLD }}>Listings by Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={listingsByType}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: '0.8rem' }} />
              <Bar dataKey="value" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: lead status distribution */}
      {leadStatus.length > 1 && (
        <div className="admin-card-grid" style={{ marginBottom: 24 }}>
          <div className="admin-card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: GOLD }}>Lead Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leadStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {leadStatus.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Hot Leads */}
          <div className="admin-card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: GOLD }}>Hot Leads</h3>
            {hotLeads.length === 0 ? (
              <EmptyState icon="fa-fire" title="No leads yet" subtitle="Leads will appear here with AI scoring" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {hotLeads.map(lead => (
                  <div key={lead.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: 8, padding: 12, cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#eee', fontSize: '0.9rem' }}>{lead.name}</span>
                      <StatusPill status={lead.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${lead._score}%`, height: '100%', background: scoreColor(lead._score), borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: scoreColor(lead._score), fontWeight: 600, minWidth: 28 }}>{lead._score}</span>
                    </div>
                    {lead.message && <p style={{ margin: 0, fontSize: '0.75rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.message.slice(0, 80)}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: GOLD }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8 }} />
          Recent Activity
        </h3>
        {activity.length === 0 ? (
          <p style={{ color: '#666', fontSize: '0.85rem' }}>No activity recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activity.slice(0, 10).map(row => (
              <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                <i className={`fa-solid ${actionIcon(row.action)}`} style={{ color: '#c5a059', width: 16, textAlign: 'center' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: '#eee', fontSize: '0.85rem' }}>{row.action}</span>
                  {row.resource_title && <span style={{ color: '#888', fontSize: '0.8rem' }}> — {row.resource_title}</span>}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{row.user_email || 'system'}</span>
                <span style={{ fontSize: '0.75rem', color: '#555', whiteSpace: 'nowrap' }}>{timeAgo(row.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <div className="admin-dialog-overlay" onClick={() => setSelectedLead(null)}>
          <div className="admin-dialog-box admin-drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{selectedLead.name}</h3>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelectedLead(null)}><i className="fa-solid fa-xmark" /></button>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              <div><strong>Email:</strong> <a href={`mailto:${selectedLead.email}`} style={{ color: GOLD }}>{selectedLead.email}</a></div>
              {selectedLead.phone && <div><strong>Phone:</strong> {selectedLead.phone}</div>}
              {selectedLead.subject && <div><strong>Subject:</strong> {selectedLead.subject}</div>}
              {selectedLead.message && <div><strong>Message:</strong><br /><p style={{ background: '#1a1a1a', padding: 8, borderRadius: 6, fontSize: '0.8rem', lineHeight: 1.5, margin: '4px 0 0' }}>{selectedLead.message}</p></div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>Score:</strong>
                <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden', maxWidth: 120 }}>
                  <div style={{ width: `${selectedLead._score}%`, height: '100%', background: scoreColor(selectedLead._score) }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: scoreColor(selectedLead._score), fontWeight: 600 }}>{selectedLead._score}</span>
              </div>
              <div><strong>Status:</strong> <StatusPill status={selectedLead.status} /></div>
            </div>

            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ width: 'fit-content' }} onClick={() => { updateStatus(selectedLead.id, 'won'); setSelectedLead(p => p && ({ ...p, status: 'won' })); }}>
                <i className="fa-solid fa-trophy" /> Mark Won
              </button>
              <button className="admin-btn admin-btn-danger admin-btn-sm" style={{ width: 'fit-content' }} onClick={() => { updateStatus(selectedLead.id, 'lost'); setSelectedLead(p => p && ({ ...p, status: 'lost' })); }}>
                <i className="fa-solid fa-xmark" /> Mark Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
