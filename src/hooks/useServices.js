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
  const [services, setServices] = useState(() => peekList(url) ?? fallbackData);
  const [loading, setLoading] = useState(() => !peekList(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!peekList(url)) setLoading(true);
    fetchList(url)
      .then((data) => {
        if (isMounted) {
          setServices(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setServices(fallbackData);
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [url]);

  return { services, loading, error };
}
