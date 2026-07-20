import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseReady, checkConnection } from '@/lib/supabase';

export function usePropertyGallery(offeringId) {
  const [relations, setRelations] = useState([]);
  const [hero, setHero] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!offeringId) {
      setRelations([]); setHero(null); setGallery([]); setLoading(false); return;
    }
    let mounted = true;
    async function load() {
      const conn = await checkConnection();
      if (!mounted) return;
      if (!conn.ok) { setError('Offline'); setLoading(false); return; }
      try {
        const { data, error: err } = await supabase
          .from('property_asset_relations')
          .select('*, asset:assets(*)')
          .eq('offering_id', offeringId)
          .order('display_order', { ascending: true });
        if (err) throw err;
        if (!mounted) return;
        const rows = data || [];
        setRelations(rows);
        setHero(rows.find(r => r.is_cover) || rows[0] || null);
        setGallery(rows.filter(r => r.gallery_role === 'gallery' || r.gallery_role === 'hero'));
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [offeringId]);

  return { relations, hero, gallery, loading, error };
}

export function getPublicUrl(asset) {
  if (!asset?.storage_path) return '/assets/images/placeholder.svg';
  const { data } = supabase.storage
    .from(asset.storage_bucket || 'apg-public')
    .getPublicUrl(asset.storage_path);
  return data.publicUrl;
}

export function getTransformedUrl(asset, options = {}) {
  const base = getPublicUrl(asset);
  const hasTransform = options.width || options.height || options.resize || options.quality || options.format;
  if (!hasTransform) return base;
  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.resize) params.set('resize', options.resize);
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format) params.set('format', options.format);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function usePrivateAsset() {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSignedUrl = useCallback(async (assetId, expiresIn = 300) => {
    setLoading(true); setError(null); setSignedUrl(null);
    try {
      const session = (await supabase.auth.getSession())?.data?.session;
      if (!session) throw new Error('No session — staff login required');
      const res = await fetch('/api/assets/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ asset_id: assetId, expires_in: expiresIn }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      setSignedUrl(url);
      return url;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearUrl = useCallback(() => setSignedUrl(null), []);

  return { signedUrl, loading, error, fetchSignedUrl, clearUrl };
}
