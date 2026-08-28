import { useState, useEffect } from 'react';

/**
 * Hook to fetch active job openings with fallback data.
 * @param {Array} fallbackData
 */
export function useCareers(fallbackData = []) {
  const [jobs, setJobs] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/careers.php');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (isMounted) {
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            setJobs(result.data);
          } else {
            setJobs(fallbackData);
          }
          setError(null);
        }
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
  }, []);

  return { jobs, loading, error };
}
