import { useState, useEffect } from 'react';

/**
 * Hook to fetch active job openings, optionally scoped to one enterprise.
 *
 * Scoping is fallback-only on the server: an enterprise with no openings of its
 * own receives corporate openings instead, so a subsidiary page is never empty
 * just because nothing was authored for it yet.
 *
 * @param {string|null} enterprise  Canonical slug, or null/'all' for every opening.
 * @param {Array} fallbackData      Rendered while loading, or if the request fails.
 */
export function useCareers(enterprise = null, fallbackData = []) {
  const [jobs, setJobs] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCareers = async () => {
      try {
        setLoading(true);
        const scoped = enterprise && enterprise !== 'all';
        const url = scoped
          ? `/api/careers.php?enterprise=${encodeURIComponent(enterprise)}`
          : '/api/careers.php';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (!isMounted) return;

        setJobs(result.success && Array.isArray(result.data) && result.data.length > 0
          ? result.data
          : fallbackData);
        setError(null);
      } catch (err) {
        if (isMounted) {
          setJobs(fallbackData);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCareers();
    return () => { isMounted = false; };
  }, [enterprise]);

  return { jobs, loading, error };
}
