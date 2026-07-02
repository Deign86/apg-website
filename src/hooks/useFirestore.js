import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      try {
        const q = query(collection(db, 'offerings'), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (mounted) setProperties(data);
      } catch (err) {
        console.error('Firestore load error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, []);

  return { properties, loading, error };
}

export function useVirtualOffices() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      try {
        let q;
        try {
          q = query(
            collection(db, 'offerings'),
            orderBy('created_at', 'desc')
          );
          const snap = await getDocs(q);
          const data = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(d =>
              d.property_type === 'VIRTUAL OFFICE' ||
              d.property_type === 'VIRTUAL_OFFICE' ||
              d.property_type === 'virtual_office'
            );
          if (mounted) setOffices(data);
        } catch (e) {
          if (e.message && e.message.indexOf('requires a range') >= 0) {
            const snap = await getDocs(collection(db, 'offerings'));
            const data = snap.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(d =>
                d.property_type === 'VIRTUAL OFFICE' ||
                d.property_type === 'VIRTUAL_OFFICE' ||
                d.property_type === 'virtual_office'
              );
            if (mounted) setOffices(data);
          } else throw e;
        }
      } catch (err) {
        console.error('Firestore load error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, []);

  return { offices, loading, error };
}
