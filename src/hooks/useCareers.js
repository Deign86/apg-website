import { useState, useEffect } from 'react';
import { fetchList, peekList } from '../lib/listCache';

/**
 * Hook to fetch active job openings, optionally scoped to one enterprise.
 *
 * A scoped request returns only that enterprise's active openings. A successful
 * empty list stays empty (pages show their "no openings" state); `fallbackData`
 * replaces the result only when the request fails (network, HTTP or database error).
 * Rows are kept for the session (src/lib/listCache), so a revisit renders them at once.
 *
 * @param {string|null} enterprise  Canonical slug, or null/'all' for every opening.
 * @param {Array} fallbackData      Rendered while loading, or if the request fails.
 */
export function useCareers(enterprise = null, fallbackData = []) {
  const scoped = enterprise && enterprise !== 'all';
  const url = scoped ? `/api/careers.php?enterprise=${encodeURIComponent(enterprise)}` : '/api/careers.php';
  const [jobs, setJobs] = useState(() => peekList(url) ?? fallbackData);
  const [loading, setLoading] = useState(() => !peekList(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!peekList(url)) setLoading(true);
    fetchList(url)
      .then((data) => {
        if (!isMounted) return;
        setJobs(data);
        setError(null);
      })
      .catch((err) => {
        if (isMounted) {
          setJobs(fallbackData);
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [url]);

  return { jobs, loading, error };
}
