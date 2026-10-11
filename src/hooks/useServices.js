import { useState, useEffect } from 'react';

/**
 * Hook to fetch service items/packages for a given enterprise with fallback.
 *
 * `category` is a canonical enterprise slug from src/data/enterprises.js; the
 * server returns only that enterprise's published rows (each with a `kind`).
 * `fallbackData` renders while loading and replaces the result only when the
 * request fails (network, HTTP or database error). A successful empty list stays
 * empty so pages show their empty state instead of hardcoded items.
 *
 * @param {string} category
 * @param {Array} fallbackData
 */
export function useServices(category, fallbackData = []) {
  const [services, setServices] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        setLoading(true);
        const url = category ? `/api/services.php?category=${encodeURIComponent(category)}` : '/api/services.php';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (result.success !== true || !Array.isArray(result.data)) throw new Error('Services unavailable');
        if (isMounted) {
          setServices(result.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setServices(fallbackData);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchServices();
    return () => { isMounted = false; };
  }, [category]);

  return { services, loading, error };
}
