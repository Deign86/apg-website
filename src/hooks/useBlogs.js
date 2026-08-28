import { useState, useEffect } from 'react';

/**
 * Hook to fetch published blog posts (or single post by slug) with fallback data.
 * @param {string|null} slug
 * @param {Array|Object} fallbackData
 */
export function useBlogs(slug = null, fallbackData = []) {
  const [blogs, setBlogs] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const url = slug ? `/api/blogs.php?slug=${encodeURIComponent(slug)}` : '/api/blogs.php';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (isMounted) {
          if (result.success && result.data) {
            setBlogs(result.data);
          } else {
            setBlogs(fallbackData);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setBlogs(fallbackData);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlogs();
    return () => { isMounted = false; };
  }, [slug]);

  return { blogs, loading, error };
}
