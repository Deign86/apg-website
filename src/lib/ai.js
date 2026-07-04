// src/lib/ai.js — Client-side AI wrappers.
// All calls go to server endpoints (/api/ai/*). The NVIDIA key NEVER reaches the browser.
// Admin routes (insights, lead) attach the current Supabase session token for auth.

import { supabase } from './supabase';

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
    const res = await fetch('/api/ai/chat', {
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

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

/**
 * Admin dashboard AI narrative. Falls back to null.narrative so callers can use heuristics.
 * @param {{properties:[],inquiries:[]}} state
 * @returns {Promise<{narrative?:string, fallback?:boolean}>}
 */
export async function aiInsights(state) {
  try {
    const res = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(state),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { narrative: null, fallback: true, message: data.message };
    return data;
  } catch {
    return { narrative: null, fallback: true, message: 'Network error' };
  }
}

/**
 * Admin single-lead analysis.
 * @param {object} lead  — an inquiries row
 * @returns {Promise<{summary?:string,nextAction?:string,suggestedReply?:string,fallback?:boolean}>}
 */
export async function aiLead(lead) {
  try {
    const res = await fetch('/api/ai/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ lead }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { fallback: true, message: data.message };
    return data;
  } catch {
    return { fallback: true, message: 'Network error' };
  }
}
