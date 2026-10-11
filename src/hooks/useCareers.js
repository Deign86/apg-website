import { useState, useEffect } from 'react';

/**
 * Hook to fetch active job openings, optionally scoped to one enterprise.
 *
 * A scoped request returns only that enterprise's active openings. A successful
 * empty list stays empty (pages show their "no openings" state); `fallbackData`
 * replaces the result only when the request fails (network, HTTP or database error).
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
        if (result.success !== true || !Array.isArray(result.data)) throw new Error('Careers unavailable');
        if (!isMounted) return;

        setJobs(result.data);
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
