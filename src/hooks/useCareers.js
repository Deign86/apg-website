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
  // The last settled request: its rows, or the fallback with the error. Another url is still loading
  // (the previous rows stay on screen meanwhile, as before).
  const [settled, setSettled] = useState(() => {
    const rows = peekList(url);
    return rows ? { url, jobs: rows, error: null } : null;
  });

  useEffect(() => {
    let isMounted = true;
    fetchList(url).then(
      (data) => { if (isMounted) setSettled({ url, jobs: data, error: null }); },
      (err) => { if (isMounted) setSettled({ url, jobs: fallbackData, error: err.message }); },
    );
    return () => { isMounted = false; };
  }, [url]);

  const current = settled?.url === url;
  return { jobs: settled ? settled.jobs : fallbackData, loading: !current, error: current ? settled.error : null };
}
