import { useState, useEffect } from 'react';
import { supabase, supabaseReady, checkConnection } from '@/lib/supabase';

export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      // Quick connectivity check first
      const conn = await checkConnection();
      if (!mounted) return;
      if (!conn.ok) {
        setOffline(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error: err } = await supabase
          .from('offerings')
          .select('*')
          .order('created_at', { ascending: false });
        if (err) throw err;
        if (mounted) setProperties(data || []);
      } catch (err) {
        console.error('Supabase load error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, []);

  return { properties, loading, error, offline };
}

export function useVirtualOffices() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      const conn = await checkConnection();
      if (!mounted) return;
      if (!conn.ok) {
        setOffline(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error: err } = await supabase
          .from('offerings')
          .select('*')
          .or('property_type.eq.VIRTUAL OFFICE,property_type.eq.VIRTUAL_OFFICE,property_type.eq.virtual_office')
          .order('created_at', { ascending: false });
        if (err) {
          // Fallback: filter client-side if the 'or' filter fails
          const { data: all, error: err2 } = await supabase
            .from('offerings')
            .select('*')
            .order('created_at', { ascending: false });
          if (err2) throw err2;
          const filtered = (all || []).filter(d =>
            d.property_type === 'VIRTUAL OFFICE' ||
            d.property_type === 'VIRTUAL_OFFICE' ||
            d.property_type === 'virtual_office'
          );
          if (mounted) setOffices(filtered);
        } else {
          if (mounted) setOffices(data || []);
        }
      } catch (err) {
        console.error('Supabase VO load error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, []);

  return { offices, loading, error, offline };
}
