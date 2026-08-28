import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch property listings with filtering, search, and pagination.
 * @param {Object} options - Filter options { type, search, city, status, featured, page, limit }
 */
export function useListings(options = {}) {
  const {
    type = '',
    search = '',
    city = '',
    status = '',
    featured = null,
    page = 1,
    limit = 24
  } = options;

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (type && type !== 'all') params.set('type', type);
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (status && status !== 'all') params.set('status', status);
      if (featured !== null && featured !== undefined) params.set('featured', String(featured));
      if (page) params.set('page', String(page));
      if (limit) params.set('limit', String(limit));

      const queryString = params.toString();
      const url = queryString ? `/api/listings.php?${queryString}` : '/api/listings.php';

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (isMounted) {
        if (result.success && Array.isArray(result.data)) {
          setListings(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          setListings([]);
        }
        setError(null);
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [type, search, city, status, featured, page, limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, pagination, refetch: fetchListings };
}
