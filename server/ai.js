// server/ai.js — Shared NVIDIA NIM (OpenAI-compatible) AI handlers.
// SERVER-ONLY. Never imported by client code. Uses process.env, not import.meta.env.
// Consumed by BOTH:
//   - server/contact.js   (local dev Node http server on :3001)
//   - api/ai/[...path].js (Vercel serverless function for production)
// The NVIDIA key is read from process.env.NVIDIA_API_KEY and NEVER shipped to the browser.

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';

/** True when an NVIDIA API key is available server-side. */
export function nvidiaConfigured() {
  return !!process.env.NVIDIA_API_KEY;
}

/**
 * Return current AI health status (no secrets). Used by GET /api/ai/health.
 * @param {object|null} supabase  — a Supabase client instance or null
 * @returns {{ nvidiaConfigured: boolean, model: string, supabase: boolean }}
 */
export function aiHealth(supabase) {
  return {
    nvidiaConfigured: nvidiaConfigured(),
    model: process.env.NVIDIA_MODEL || 'stepfun-ai/step-3.7-flash',
    supabase: !!supabase,
  };
}

/**
 * Call the NVIDIA NIM chat-completions endpoint (OpenAI-compatible).
 * @param {Array<{role:string,content:string}>} messages
 * @param {{temperature?:number,max_tokens?:number,top_p?:number,model?:string}} [opts]
 * @returns {Promise<string>} the assistant message content (trimmed)
 */
export async function nvidiaChat(messages, opts = {}) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY not configured');
  const model = opts.model || process.env.NVIDIA_MODEL || 'stepfun-ai/step-3.7-flash';
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.4,
      top_p: opts.top_p ?? 0.7,
      max_tokens: opts.max_tokens ?? 1024,
      stream: false,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    // On 404/400, retry once with a documented fallback model
    if ((res.status === 404 || res.status === 400) && !opts._retried) {
      console.warn(`NVIDIA model "${model}" failed (${res.status}), retrying with meta/llama-3.1-8b-instruct`);
      return nvidiaChat(messages, { ...opts, model: 'meta/llama-3.1-8b-instruct', _retried: true });
    }
    throw new Error(`NVIDIA API ${res.status}: ${txt.slice(0, 240)}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error('NVIDIA returned no content');
  return content.trim();
}

// ---- Business context (assembled from live Supabase data via service-role client) ----

async function buildBusinessContext(supabase) {
  if (!supabase) return null;
  try {
    const [settings, offerings, jobs, blogs, kb] = await Promise.all([
      supabase.from('site_settings').select('key,value'),
      supabase
        .from('offerings')
        .select('title,location,property_type,price,price_unit,status,slug')
        .eq('is_published', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('job_openings').select('title,location,type,tag').eq('status', 'active').limit(10),
      supabase
        .from('blog_posts')
        .select('title,category')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(8),
      supabase.from('chatbot_kb').select('trigger,answer').eq('active', true).order('priority', { ascending: false }),
    ]);
    return {
      settings: Object.fromEntries((settings.data || []).map((s) => [s.key, s.value])),
      offerings: offerings.data || [],
      jobs: jobs.data || [],
      blogs: blogs.data || [],
      kb: kb.data || [],
    };
  } catch {
    return null;
  }
}

function formatBusinessContext(ctx) {
  if (!ctx) {
    return (
      'You are "Alpha", the friendly virtual assistant for Alpha Premier Group (APG), ' +
      'a Philippine conglomerate offering realty, virtual office, construction, and professional services. ' +
      'Be concise, warm, and helpful. If unsure, offer to connect the visitor to the team. Keep replies under 120 words.'
    );
  }
  const s = ctx.settings || {};
  const parts = [];
  parts.push(
    'You are "Alpha", the friendly virtual assistant for Alpha Premier Group (APG), a Philippine conglomerate ' +
      '(Realty, Virtual Office, Construction, Swift Clear, Dynamic Tree, Luxe Prime, AltaVenture, 88 Prime). ' +
      'Be concise, warm, and helpful. Answer based ONLY on the company info below. If you are unsure or the question ' +
      'needs a human (pricing negotiations, legal, scheduling), say you will connect them to the team. Keep replies under 120 words.'
  );
  if (s.company_email || s.company_phone || s.company_address) {
    parts.push(
      'Contact: ' + [s.company_email, s.company_phone, s.company_address].filter(Boolean).join(' | ')
    );
  }
  if (s.social_facebook || s.social_instagram || s.social_linkedin) {
    parts.push(
      'Social: ' + [s.social_facebook, s.social_instagram, s.social_linkedin].filter(Boolean).join(', ')
    );
  }
  if (ctx.offerings.length) {
    parts.push(
      'Current properties: ' +
        ctx.offerings
          .map((o) =>
            `${o.title}${o.location ? ' (' + o.location + ')' : ''}` +
            `${o.property_type ? ' [' + o.property_type + ']' : ''}` +
            `${o.price ? ' ' + (o.price_unit || '₱') + o.price : ''}`
          )
          .join('; ')
    );
  }
  if (ctx.jobs.length) {
    parts.push(
      'Open roles: ' + ctx.jobs.map((j) => `${j.title} (${j.location || 'PH'}, ${j.type || ''})`).join('; ')
    );
  }
  if (ctx.blogs.length) {
    parts.push('Recent articles: ' + ctx.blogs.map((b) => `"${b.title}"`).join(', '));
  }
  if (ctx.kb.length) {
    parts.push(
      'Knowledge base facts (use these when relevant):\n' +
        ctx.kb.map((k) => `- ${k.trigger}: ${k.answer}`).join('\n')
    );
  }
  return parts.join('\n\n');
}

// ---- Handlers (return { status, data }; caller sends the HTTP response) ----

/**
 * POST /api/ai/chat  — PUBLIC (no auth). Conversational chatbot.
 * body: { message: string, history?: [{role:'user'|'assistant', content:string}] }
 * returns: { content } on success, or { fallback:true, ... } on failure.
 */
export async function handleAiChat(supabase, body) {
  if (!nvidiaConfigured()) {
    return { status: 503, data: { message: 'AI not configured', fallback: true } };
  }
  const userMessage = (body?.message || '').toString().slice(0, 1000);
  if (!userMessage.trim()) return { status: 400, data: { message: 'Message required' } };

  const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];
  const ctx = await buildBusinessContext(supabase);
  const systemPrompt = formatBusinessContext(ctx);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, 1000),
    })),
    { role: 'user', content: userMessage },
  ];

  let assistantContent = '';
  try {
    assistantContent = await nvidiaChat(messages, { temperature: 0.5, max_tokens: 400 });

    // Persist conversation turns for admin insight (best-effort, non-blocking)
    if (supabase) {
      const sessionId = body?.sessionId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
      const userIdentifier = body?.userEmail || body?.sessionId || 'visitor';
      const turns = [
        { session_id: sessionId, user_identifier: userIdentifier, role: 'user', content: userMessage, model: process.env.NVIDIA_MODEL },
        { session_id: sessionId, user_identifier: userIdentifier, role: 'assistant', content: assistantContent, model: process.env.NVIDIA_MODEL },
      ];
        // Fire-and-forget: wrap with Promise.resolve() so .catch() works on Supabase v2 thenables
        Promise.resolve(supabase.from('chat_logs').insert(turns))
          .then(() => {})
          .catch(err => console.error('chat_logs insert failed:', err.message));
    }

    return { status: 200, data: { content: assistantContent } };
  } catch (err) {
    console.error('AI chat error:', err.message);
    return { status: 502, data: { message: 'AI request failed', fallback: true, error: err.message } };
  }
}

/**
 * POST /api/ai/insights — ADMIN only (caller must verify auth).
 * body: { properties?: [], inquiries?: [] }
 * returns: { narrative: string } or { fallback:true, ... }
 */
export async function handleAiInsights(supabase, body) {
  if (!nvidiaConfigured()) {
    return { status: 503, data: { message: 'AI not configured', fallback: true } };
  }
  const properties = Array.isArray(body?.properties) ? body.properties : [];
  const inquiries = Array.isArray(body?.inquiries) ? body.inquiries : [];

  const statuses = inquiries.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});
  const staleCount = properties.filter(
    (p) => p.updated_at && (Date.now() - new Date(p.updated_at).getTime()) / 86400000 > 60
  ).length;

  const summary = {
    totalListings: properties.length,
    totalLeads: inquiries.length,
    leadStatuses: statuses,
    staleListings: staleCount,
    recentLeads: inquiries.slice(0, 10).map((l) => ({
      name: l.name,
      status: l.status,
      source: l.source,
      score: l.lead_score,
      created: l.created_at,
      message: (l.message || '').slice(0, 120),
    })),
  };

  const messages = [
    {
      role: 'system',
      content:
        'You are an analytics assistant for a real-estate business admin dashboard. Given JSON data about listings ' +
        'and leads, write a short "narrative" (2-3 sentences) that summarizes the state of the business and names ONE ' +
        'priority action for the admin. Be professional, specific, and concise. Return ONLY valid JSON: {"narrative":"..."}',
    },
    { role: 'user', content: JSON.stringify(summary) },
  ];

  try {
    let content = await nvidiaChat(messages, { temperature: 0.3, max_tokens: 300 });
    // Strip accidental markdown code fences
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    let narrative = '';
    try {
      narrative = JSON.parse(content).narrative || '';
    } catch {
      narrative = content;
    }
    return { status: 200, data: { narrative } };
  } catch (err) {
    console.error('AI insights error:', err.message);
    return { status: 502, data: { message: 'AI request failed', fallback: true, error: err.message } };
  }
}

/**
 * POST /api/ai/lead — ADMIN only (caller must verify auth).
 * body: { lead: inquiryRow }
 * returns: { summary, nextAction, suggestedReply } or { fallback:true, ... }
 */
export async function handleAiLead(supabase, body) {
  if (!nvidiaConfigured()) {
    return { status: 503, data: { message: 'AI not configured', fallback: true } };
  }
  const lead = body?.lead;
  if (!lead) return { status: 400, data: { message: 'Lead required' } };

  const messages = [
    {
      role: 'system',
      content:
        'You are a sales assistant for a Philippine real-estate company (Alpha Premier Group). Analyze a lead inquiry ' +
        'and return ONLY valid JSON with keys: "summary" (1 sentence), "nextAction" (recommended next step, 1 sentence), ' +
        '"suggestedReply" (a polite, professional reply email body, 3-5 sentences, ready to send). Be concise and actionable.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        subject: lead.subject,
        message: lead.message,
        source: lead.source,
        status: lead.status,
        property_id: lead.property_id,
      }),
    },
  ];

  try {
    let content = await nvidiaChat(messages, { temperature: 0.4, max_tokens: 500 });
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content, nextAction: 'Follow up by email or phone within 24 hours.', suggestedReply: '' };
    }
    return { status: 200, data: parsed };
  } catch (err) {
    console.error('AI lead error:', err.message);
    return { status: 502, data: { message: 'AI request failed', fallback: true, error: err.message } };
  }
}
