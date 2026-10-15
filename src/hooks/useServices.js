import { useState, useEffect } from 'react';
import { fetchList, peekList } from '../lib/listCache';

/**
 * Hook to fetch service items/packages for a given enterprise with fallback.
 *
 * `category` is a canonical enterprise slug from src/data/enterprises.js; the
 * server returns only that enterprise's published rows (each with a `kind`).
 * `fallbackData` renders while loading and replaces the result only when the
 * request fails (network, HTTP or database error). A successful empty list stays
 * empty so pages show their empty state instead of hardcoded items.
 * Rows are kept for the session (src/lib/listCache), so a revisit renders them at once.
 *
 * @param {string} category
 * @param {Array} fallbackData
 */
export function useServices(category, fallbackData = []) {
  const url = category ? `/api/services.php?category=${encodeURIComponent(category)}` : '/api/services.php';
  // The last settled request: its rows, or the fallback with the error. Another url is still loading
  // (the previous rows stay on screen meanwhile, as before).
  const [settled, setSettled] = useState(() => {
    const rows = peekList(url);
    return rows ? { url, services: rows, error: null } : null;
  });

  useEffect(() => {
    let isMounted = true;
    fetchList(url).then(
      (data) => { if (isMounted) setSettled({ url, services: data, error: null }); },
      (err) => { if (isMounted) setSettled({ url, services: fallbackData, error: err.message }); },
    );
    return () => { isMounted = false; };
  }, [url]);

  const current = settled?.url === url;
  return { services: settled ? settled.services : fallbackData, loading: !current, error: current ? settled.error : null };
}
