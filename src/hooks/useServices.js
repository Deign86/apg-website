import { useState, useEffect } from 'react';

/**
 * Hook to fetch service items/packages for a given category with fallback.
 * Categories: 'virtual-office', '88prime', 'construction', 'swiftclear', 'altaventure', 'realty'
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
        if (isMounted) {
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            setServices(result.data);
          } else {
            setServices(fallbackData);
          }
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
