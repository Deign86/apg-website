import { supabase } from './supabase';

// Best-effort activity logging — never blocks UI on failure.
export async function logActivity(action, entity, entityId, meta) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action,
      entity,
      entity_id: entityId ? String(entityId) : null,
      meta: meta || null,
    });
  } catch (err) {
    console.warn('logActivity error (non-blocking):', err);
  }
}
