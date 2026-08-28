// src/lib/ai.js — Client-side AI concierge helper.

/**
 * Public chatbot conversation.
 * @param {string} message
 * @param {Array<{role:string,content:string}>} [history]
 * @param {{sessionId?:string,userEmail?:string}} [meta]
 * @returns {Promise<{content?:string,fallback?:boolean,message?:string}>}
 */
export async function aiChat(message, history = [], meta = {}) {
  try {
    const body = { message, history };
    if (meta.sessionId) body.sessionId = meta.sessionId;
    if (meta.userEmail) body.userEmail = meta.userEmail;
    const res = await fetch('/api/ai/chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { content: null, fallback: true, message: data.message || 'AI unavailable' };
    return data;
  } catch {
    return { content: null, fallback: true, message: 'Network error' };
  }
}
