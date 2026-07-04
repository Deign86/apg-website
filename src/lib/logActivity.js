// src/lib/logActivity.js — logs admin actions to activity_log table
// Best-effort — never blocks UI on failure.
import { supabase } from './supabase';

export async function logActivity({
  action,
  resourceType,
  resourceId,
  resourceTitle = '',
  details = '',
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const userEmail = user.email || '';
    await supabase.from('activity_log').insert({
      user_email: userEmail,
      action,
      resource_type: resourceType,
      resource_id: resourceId ? String(resourceId) : null,
      resource_title: resourceTitle,
      details,
    });
  } catch (err) {
    console.warn('logActivity error (non-blocking):', err);
  }
}
