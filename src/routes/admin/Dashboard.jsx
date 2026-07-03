import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import StatCard from '@/components/admin/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState({ listings: 0, leads: 0, pipeline: 0, wins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [{ count: listings }, { data: leads }, { count: wins }] = await Promise.all([
          supabase.from('offerings').select('*', { count: 'exact', head: true }).eq('is_published', true).is('deleted_at', null),
          supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
          supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'won'),
        ]);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const newLeads = (leads || []).filter(l => new Date(l.created_at) >= monthAgo).length;
        const qualifiedIds = (leads || []).filter(l => l.status === 'qualified' && l.property_id).map(l => l.property_id);
        setStats({
          listings: listings || 0,
          leads: newLeads,
          pipeline: qualifiedIds.length,
          wins: wins || 0,
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Helmet><title>Dashboard | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>
      {loading ? (
        <div className="admin-loading-screen"><div className="admin-spinner" /></div>
      ) : (
        <div className="admin-stats-grid">
          <StatCard icon="fa-building" label="Active Listings" value={stats.listings} />
          <StatCard icon="fa-users" label="New Leads (30d)" value={stats.leads} />
          <StatCard icon="fa-arrow-trend-up" label="Active Pipeline" value={stats.pipeline} />
          <StatCard icon="fa-trophy" label="Closed Won" value={stats.wins} />
        </div>
      )}
    </>
  );
}
