import { useCallback, useEffect, useState } from 'react';
import { checkConnection, supabase, supabaseReady } from '@/lib/supabase';

function normalizeRelations(rows) {
  return (rows || []).map((row) => ({
    ...row,
    asset: Array.isArray(row.asset) ? row.asset[0] || null : row.asset,
  })).filter((row) => row.asset?.is_public !== false && row.asset?.ingestion_status !== 'archived');
}

export function useListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabaseReady) {
      setOffline(true);
      setLoading(false);
      return;
    }
    setError(null);
    const connection = await checkConnection();
    if (!connection.ok) {
      setOffline(true);
      setLoading(false);
      return;
    }
    try {
      const offeringsResult = await supabase
        .from('offerings')
        .select('*')
        .eq('listing_status', 'published')
        .eq('is_published', true)
        .is('deleted_at', null)
        .is('archived_at', null)
        .order('created_at', { ascending: false });
      if (offeringsResult.error) throw offeringsResult.error;
      const offerings = offeringsResult.data || [];
      const ids = offerings.map((row) => row.id);
      const relationsResult = ids.length
        ? await supabase.from('property_asset_relations')
          .select('offering_id,asset_id,gallery_role,display_order,is_cover,alt_text,caption,asset:assets(id,storage_path,storage_bucket,mime_type,original_name,is_public,ingestion_status,checksum_sha256,drive_md5_checksum)')
          .in('offering_id', ids)
          .order('display_order', { ascending: true })
        : { data: [], error: null };
      if (relationsResult.error) throw relationsResult.error;
      const byOffering = new Map();
      for (const row of normalizeRelations(relationsResult.data)) {
        const list = byOffering.get(String(row.offering_id)) || [];
        list.push(row);
        byOffering.set(String(row.offering_id), list);
      }
      setOffline(false);
      setProperties(offerings.map((row) => ({ ...row, gallery: byOffering.get(String(row.id)) || [] })));
    } catch (loadError) {
      console.error('Supabase listing load error:', loadError);
      setError(loadError.message || 'Unable to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timer;
    refresh();
    const refreshSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (active) refresh(); }, 150);
    };
    if (!supabaseReady) return () => { active = false; clearTimeout(timer); };
    const channel = supabase
      .channel('public-listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offerings' }, refreshSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_asset_relations' }, refreshSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, refreshSoon)
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && active) setError('Live listing updates are unavailable');
      });
    return () => {
      active = false;
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { properties, listings: properties, loading, error, offline, refresh };
}

export default useListings;
