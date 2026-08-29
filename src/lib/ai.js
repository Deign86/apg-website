// src/lib/ai.js — Client-side Live Chat & Scripted FAQ Service.
// Replaces dead AI provider calls with native deterministic triage,
// session persistence, polling, and live broker handoff.

const STORAGE_KEY = 'apg_chat_session_token';

/**
 * Get or store session token in localStorage.
 */
export function getSavedSessionToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function saveSessionToken(token) {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Initialize or restore a visitor chat session.
 * @param {string} enterpriseSlug
 * @param {string|null} sessionToken
 * @returns {Promise<{success:boolean, session?:object, messages?:Array}>}
 */
export async function startChatSession(enterpriseSlug = 'apg-main', sessionToken = null) {
  try {
    const token = sessionToken || getSavedSessionToken();
    const res = await fetch('/api/chat/start.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: token,
        enterprise_slug: enterpriseSlug,
      }),
    });
    const data = await res.json();
    if (data.success && data.session?.session_token) {
      saveSessionToken(data.session.session_token);
    }
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send visitor message or trigger live handoff.
 * @param {string} sessionToken
 * @param {string} message
 * @param {string} enterpriseSlug
 * @param {boolean} [isHandoff=false]
 * @returns {Promise<{success:boolean, reply?:string, status?:string, handoff?:boolean}>}
 */
export async function sendChatMessage(sessionToken, message, enterpriseSlug = 'apg-main', isHandoff = false) {
  try {
    const res = await fetch('/api/chat/message.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: sessionToken,
        message,
        enterprise_slug: enterpriseSlug,
        is_handoff: isHandoff,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Poll for status changes and incoming admin messages.
 * @param {string} sessionToken
 * @param {number} afterId
 * @returns {Promise<{success:boolean, status?:string, assigned_admin_name?:string, messages?:Array}>}
 */
export async function pollChatSession(sessionToken, afterId = 0) {
  try {
    const res = await fetch(`/api/chat/poll.php?session_token=${encodeURIComponent(sessionToken)}&after_id=${afterId}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Backward compatibility helper for legacy aiChat imports.
 */
export async function aiChat(message, history = [], meta = {}) {
  const token = meta.sessionId || getSavedSessionToken();
  const res = await sendChatMessage(token, message, meta.enterprise || 'apg-main', false);
  if (res.success) {
    return { content: res.reply, fallback: false };
  }
  return { content: null, fallback: true };
}
