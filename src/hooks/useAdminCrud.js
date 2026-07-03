import { useState, useCallback } from 'react';
import { supabase } from './supabase';
import { logActivity } from './logActivity';

export default function useAdminCrud(table) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (row) => {
    setSaving(true); setError(null);
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) { setError(error.message); setSaving(false); return null; }
    logActivity(`${table}.create`, table, data.id, row);
    setSaving(false);
    return data;
  }, [table]);

  const update = useCallback(async (id, patch) => {
    setSaving(true); setError(null);
    const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single();
    if (error) { setError(error.message); setSaving(false); return null; }
    logActivity(`${table}.update`, table, id, patch);
    setSaving(false);
    return data;
  }, [table]);

  const softDelete = useCallback(async (id) => {
    setSaving(true); setError(null);
    const { error } = await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) { setError(error.message); setSaving(false); return false; }
    logActivity(`${table}.delete`, table, id);
    setSaving(false);
    return true;
  }, [table]);

  const remove = useCallback(async (id) => {
    setSaving(true); setError(null);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { setError(error.message); setSaving(false); return false; }
    logActivity(`${table}.hard_delete`, table, id);
    setSaving(false);
    return true;
  }, [table]);

  return { saving, error, create, update, softDelete, remove };
}
