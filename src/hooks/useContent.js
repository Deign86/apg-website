import { useState, useEffect } from 'react';

/**
 * Hook to fetch content blocks for a specific page with fallback data.
 * @param {string} pageSlug
 * @param {Record<string, any>} fallbackData
 */
export function useContent(pageSlug, fallbackData = {}) {
  const [content, setContent] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      try {
        setLoading(true);
        const url = pageSlug ? `/api/content.php?page=${encodeURIComponent(pageSlug)}` : '/api/content.php';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (isMounted) {
          if (result.success && result.data && Object.keys(result.data).length > 0) {
            setContent(prev => ({ ...fallbackData, ...prev, ...result.data }));
          } else {
            setContent(fallbackData);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setContent(fallbackData);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContent();
    return () => { isMounted = false; };
  }, [pageSlug]);

  return { content, loading, error };
}
