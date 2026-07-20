// server/ai.js — Shared NVIDIA NIM (OpenAI-compatible) AI handlers.
// SERVER-ONLY. Never imported by client code. Uses process.env, not import.meta.env.
// Consumed by BOTH:
//   - server/contact.js   (local dev Node http server on :3001)
//   - api/ai/[...path].js (Vercel serverless function for production)
// The NVIDIA key is read from process.env.NVIDIA_API_KEY and NEVER shipped to the browser.

const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';

// ================================================================
// BASE SYSTEM PROMPT — static rules used in every chatbot response
// ================================================================
const BASE_SYSTEM_PROMPT = `You are "Alpha", the official website assistant for Alpha Premier Group of Companies / Alpha Premier Realty. You help visitors understand the company, available services, property categories, contact options, and next steps for inquiries or viewings. You sound like an in-house company representative, not a generic AI.

SOURCES YOU MAY USE (in this priority order — higher wins on conflict):
1. Verified internal knowledge base facts (highest authority).
2. Approved summaries from the official company website / live catalog.
3. Approved summaries from the official Facebook page (lower authority unless marked current/approved).
4. The current conversation only.
NEVER invent facts, listings, prices, availability, policies, addresses, timelines, or contact details. If an answer is not clearly supported by the provided knowledge, say the information is not currently available and offer to connect the visitor to a human representative.

COMPANY CONTEXT (CORE FACTS — use as baseline truth):
- Brand: Alpha Premier Group of Companies / Alpha Premier Realty
- Positioning: professionalism, flexibility, and efficiency
- Core business: residential, commercial, and industrial real estate
- Services: real estate brokerage, property advisory, and related support services
- Location: Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City
- Leadership: Mr. Mark Anthony Abito-Santos, President and Chief Executive Officer
- Official contact: Phone 0915 888 9482 / 02 8 650 2540 | Email contact@alphapremier.com | Facebook https://www.facebook.com/alphapremierRealty
Always refer to the company as "Alpha Premier Group of Companies" or "Alpha Premier Realty," matching the user's phrasing when natural. If retrieved website, Facebook, or database context conflicts with these core facts, prefer the core company facts (including the official contact details above) unless there is an explicit, approved update in the knowledge base.

OFFICIAL CONTACT INFORMATION (surface these EXACT details when a visitor asks for contact info, a phone number, email, address, office location, or Facebook page):
- Phone: 0915 888 9482 / 02 8 650 2540
- Email: contact@alphapremier.com
- Address: Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City
- Facebook: https://www.facebook.com/alphapremierRealty
If any provided knowledge/database context lists different contact details, prefer these official details unless there is an explicit, approved update in the knowledge base.

LEADERSHIP QUESTIONS:
When asked about the CEO, founder, president, or leadership: confirm that Mr. Mark Anthony Abito-Santos is the President and Chief Executive Officer. Do not invent additional details (education, past roles, personal background) unless explicitly present in the retrieved knowledge. If the user asks for more details beyond what you know, say: "Based on the information currently available to me, I can confirm his role as President and CEO, but I don't have additional details. Next step: I can connect you with our team if you'd like more background."

EXAMPLE RESPONSE FOR CEO QUESTIONS:
User: "Who is your CEO?"
Assistant: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you need more background about his role or the company's leadership team, I can connect you with our office."

ANSWERING RULES:
- Be concise, warm, professional, and real-estate aware. No invented marketing hype.
- When asked about a property, give only details present in the provided knowledge.
- On pricing, availability, exact inventory, or legal/contract matters: answer only if explicit verified data exists.
- If details may have changed, add: "Availability and details may change; I recommend confirming with our team."
- If the visitor wants to visit, book, or negotiate, collect lead details and escalate to a human sales agent.

SAFETY / ACCURACY:
- Do not claim a property is available now unless the provided context confirms it.
- Do not make legal, financial, or investment guarantees.
- Do not fabricate square footage, price, lease terms, commissions, addresses, or amenities.
- If uncertain, say so plainly and offer to connect the visitor with the team.

LEAD CAPTURE (when a visitor shows buying/leasing intent): Politely collect: full name; contact number or email; property type needed; preferred location; budget range; preferred schedule for viewing or callback. Then tell them the inquiry will be endorsed to the Alpha Premier team. When you have received enough information to endorse the lead, end your response with the hidden marker: [LEAD]name|contact|property_type|location|budget|schedule[/LEAD] using only the fields the visitor provided. This marker will be hidden from the visitor.

OUTPUT FORMAT:
1. Answer the question first.
2. If relevant, add a short "Next step:" line.
3. If the answer depends on missing data, state the limitation plainly and recommend human follow-up.
Keep replies tight (aim under ~120 words) unless lead-capture requires more.

EXAMPLE FALLBACK:
"Based on the information currently available to me, I can help with Alpha Premier's services and general inquiry guidance, but I can't confirm that specific property detail yet. Next step: please share the property name or let me connect you with our team for the latest availability."

=== PROVIDED KNOWLEDGE (use only this; do not go beyond it) ===`;


// ================================================================
// LEADERSHIP / CEO GUARD
// Guarantees a catered reply about the company's leader regardless of
// whether the configured LLM follows the (sometimes long) BASE_SYSTEM_PROMPT.
// Weak fallback models (e.g. 8B instruct) routinely ignore buried
// system-prompt instructions, so we detect leadership intent server-side and
// either return the approved canned answer directly or inject a forceful
// directive. Kept in sync with the client-side fallback in Chatbot.jsx.
// ================================================================
const CEO_NAME = 'Mr. Mark Anthony Abito-Santos';
const CEO_ROLE = 'President and Chief Executive Officer';

const CANNED_LEADERSHIP_REPLY =
  `Our ${CEO_ROLE} is ${CEO_NAME}. ` +
  'He leads Alpha Premier Group of Companies and its real estate operations. ' +
  'If you need more background about his role or the company\'s leadership team, I can connect you with our office.';

// Strong leadership nouns. Matching one of these triggers the forceful LLM
// directive (the visitor is clearly asking about company leadership).
// Deliberately focused (no bare "owner"/"head"/"leader") to avoid false
// positives like "property owner" in a real-estate context.
const LEADERSHIP_TERM_RE =
  /\b(ceo|c\.?e\.?o|presidents?|founders?|leadership|managing director|executive director|in[\s-]charge|runs the company|head of (?:the )?company)\b/i;

// The CEO's own name. A name mention alone is NOT treated as a leadership
// question (a visitor might say "my friend Mark Anthony referred me"), so it
// does not trigger the directive on its own — but it does qualify a message
// for the canned identity reply when paired with a who/name phrasing.
const LEADERSHIP_NAME_RE = /\b(abito[\s-]?santos|abito|mark\s+anthony)\b/i;

// A *clear identity* question (who is the CEO / who runs the company / what's
// the president's name / "is X the ceo"). These get the canned, guaranteed
// answer without calling the LLM at all.
const LEADERSHIP_IDENTITY_RE =
  /\b(who(?:'s| is| are| runs| leads| heads| manages)|name of|tell me the name|what(?:'s| is)\b.{0,15}name|is .{0,30}(?:ceo|president|founder))\b/i;

function isLeadershipMessage(text) {
  return LEADERSHIP_TERM_RE.test(text || '');
}

function mentionsLeaderName(text) {
  return LEADERSHIP_NAME_RE.test(text || '');
}

function isLeadershipIdentityQuestion(text) {
  const t = (text || '').trim();
  if (!t) return false;
  if (!(isLeadershipMessage(t) || mentionsLeaderName(t))) return false;
  if (LEADERSHIP_IDENTITY_RE.test(t)) return true;
  // Very short message that is essentially just a leadership noun/phrase
  // (e.g. "ceo?", "the president", "mark anthony abito-santos").
  if (t.split(/\s+/).length <= 4) return true;
  return false;
}


// ================================================================
// OFFICIAL CONTACT INFORMATION GUARD
// Static, authoritative contact details. Surfaced via a server-side guard so
// visitors always get the correct phone/email/address/Facebook regardless of
// AI model behaviour or Supabase state — mirrors the leadership guard above.
// Kept in sync with the client-side fallback in Chatbot.jsx, the site_settings
// seed data, and the OFFICIAL CONTACT INFORMATION block in BASE_SYSTEM_PROMPT.
// ================================================================
const OFFICIAL_CONTACT = {
  phone: '0915 888 9482 / 02 8 650 2540',
  email: 'contact@alphapremier.com',
  address:
    'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City',
  facebook: 'https://www.facebook.com/alphapremierRealty',
};

const CONTACT_FULL_REPLY =
  `You can reach Alpha Premier at ${OFFICIAL_CONTACT.phone}, or email ${OFFICIAL_CONTACT.email}. ` +
  `Our office is at ${OFFICIAL_CONTACT.address}. ` +
  `You can also message us on Facebook: ${OFFICIAL_CONTACT.facebook}`;

const CONTACT_PHONE_RE = /\b(phone|contact number|mobile|cellphone|dial|hotline)\b/i;
const CONTACT_EMAIL_RE = /\b(email|e-mail)\b/i;
const CONTACT_ADDRESS_RE =
  /\b(address|where.{0,12}(?:located|based|office)|office location|located at|branch(?:es)?)\b/i;
const CONTACT_FB_RE = /\b(facebook|fb\s+page|fb\s+link|fb\s+url|social media|social page|socials)\b/i;
const CONTACT_GENERIC_RE = /\b(contact info|contact details|reach you|get in touch|contact you|how to contact)\b/i;

/**
 * Detect a clear contact-info request and return which detail to surface.
 * Returns one of: 'phone' | 'email' | 'address' | 'facebook' | 'full' | null.
 * Deliberately strict on the generic path to avoid intercepting lead capture
 * ("I want to contact you about a property" → null, falls through to the AI).
 */
function detectContactIntent(text) {
  const t = (text || '').trim();
  if (!t) return null;
  const short = t.split(/\s+/).length <= 5;
  const hasQWord = /\b(what|what's|whats|how|where|which)\b/i.test(t);
  const hasYourThe = /\b(your|the)\b/i.test(t);

  const specific = [];
  if (CONTACT_FB_RE.test(t)) specific.push('facebook');
  if (CONTACT_PHONE_RE.test(t)) specific.push('phone');
  if (CONTACT_EMAIL_RE.test(t)) specific.push('email');
  if (CONTACT_ADDRESS_RE.test(t)) specific.push('address');
  if (specific.length > 1) return 'full';
  if (specific.length === 1) {
    if (hasQWord || hasYourThe || short) return specific[0];
    return null;
  }
  // Generic contact request — stricter phrasing to avoid false positives.
  if (CONTACT_GENERIC_RE.test(t) && (hasQWord || short)) return 'full';
  return null;
}

function contactReply(kind) {
  switch (kind) {
    case 'phone':
      return `You can reach us at ${OFFICIAL_CONTACT.phone}. Would you like to be connected with our team?`;
    case 'email':
      return `You can email us at ${OFFICIAL_CONTACT.email}. Anything else I can help with?`;
    case 'address':
      return `Our office is at ${OFFICIAL_CONTACT.address}. Would you like directions or to schedule a visit?`;
    case 'facebook':
      return `You can find us on Facebook at ${OFFICIAL_CONTACT.facebook}. Anything else I can help with?`;
    default:
      return CONTACT_FULL_REPLY;
  }
}


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
    model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
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
  const model = opts.model || process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';
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
    if (
      (res.status === 404 || res.status === 400 || res.status === 402) &&
      !opts._retried
    ) {
      console.warn(
        `NVIDIA model "${model}" failed (${res.status}), retrying with meta/llama-3.1-8b-instruct`,
      );
      return nvidiaChat(messages, {
        ...opts,
        model: 'meta/llama-3.1-8b-instruct',
        _retried: true,
      });
    }
    // On 5xx, retry once — NVIDIA occasionally returns transient 5xx
    if (
      (res.status === 502 || res.status === 503 || res.status === 429) &&
      !opts._retried
    ) {
      console.warn(
        `NVIDIA model "${model}" returned ${res.status}, retrying once`,
      );
      return nvidiaChat(messages, { ...opts, _retried: true });
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
    const [settings, offerings, jobs, blogs, kb, archived, facebook] = await Promise.all([
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
      supabase.from('archived_context').select('section,title,summary').eq('active', true).order('priority', { ascending: false }),
      supabase.from('facebook_context').select('title,summary').eq('active', true).order('created_at', { ascending: false }),
    ]);
    return {
      settings: Object.fromEntries((settings.data || []).map((s) => [s.key, s.value])),
      offerings: offerings.data || [],
      jobs: jobs.data || [],
      blogs: blogs.data || [],
      kb: kb.data || [],
      archived: archived.data || [],
      facebook: facebook.data || [],
    };
  } catch {
    return null;
  }
}

function formatBusinessContext(ctx) {
  if (!ctx) {
    return BASE_SYSTEM_PROMPT;
  }
  const s = ctx.settings || {};
  const parts = [BASE_SYSTEM_PROMPT];

  // -- Contact information --
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

  // -- Current property listings --
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

  // -- Open job roles --
  if (ctx.jobs.length) {
    parts.push(
      'Open roles: ' + ctx.jobs.map((j) => `${j.title} (${j.location || 'PH'}, ${j.type || ''})`).join('; ')
    );
  }

  // -- Recent blog articles --
  if (ctx.blogs.length) {
    parts.push('Recent articles: ' + ctx.blogs.map((b) => `"${b.title}"`).join(', '));
  }

  // -- Knowledge base facts --
  if (ctx.kb.length) {
    parts.push(
      'Knowledge base facts (use these when relevant):\n' +
        ctx.kb.map((k) => `- ${k.trigger}: ${k.answer}`).join('\n')
    );
  }

  // -- Archived website context (lower priority than live KB/offerings) --
  if (ctx.archived && ctx.archived.length) {
    parts.push(
      'ARCHIVED WEBSITE CONTEXT (lower priority; may be outdated — use live data when it conflicts):\n' +
        ctx.archived.map((a) => `- [${a.section}] ${a.title}: ${a.summary}`).join('\n')
    );
  }

  // -- Facebook context (lowest priority) --
  if (ctx.facebook && ctx.facebook.length) {
    parts.push(
      'FACEBOOK CONTEXT (lowest priority; only recent marketing/listing info):\n' +
        ctx.facebook.map((f) => `- ${f.title ? f.title + ': ' : ''}${f.summary}`).join('\n')
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
  const userMessage = (body?.message || '').toString().slice(0, 1000);
  if (!userMessage.trim()) return { status: 400, data: { message: 'Message required' } };

  // ---- Leadership / CEO guard ----------------------------------------------
  // Runs BEFORE the AI-config check: a guaranteed catered reply about the
  // President & CEO is returned even when NVIDIA_API_KEY is not configured
  // (e.g. a Vercel deployment missing env vars), because this needs no LLM.
  // Nuanced leadership questions still go through the model below with a
  // forceful directive + low temperature so it stays on-script.
  const leadershipIdentity = isLeadershipIdentityQuestion(userMessage);

  if (leadershipIdentity) {
    if (supabase) {
      const sessionId =
        body?.sessionId ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
      const userIdentifier = body?.userEmail || body?.sessionId || 'visitor';
      const turns = [
        { session_id: sessionId, user_identifier: userIdentifier, role: 'user', content: userMessage, model: 'canned-leadership' },
        { session_id: sessionId, user_identifier: userIdentifier, role: 'assistant', content: CANNED_LEADERSHIP_REPLY, model: 'canned-leadership' },
      ];
      Promise.resolve(supabase.from('chat_logs').insert(turns))
        .then(() => {})
        .catch((err) => console.error('chat_logs insert failed:', err.message));
    }
    return { status: 200, data: { content: CANNED_LEADERSHIP_REPLY } };
  }

  // ---- Contact information guard -------------------------------------------
  // Runs BEFORE the AI-config check: surface the official phone/email/address/
  // Facebook link for clear contact requests even when NVIDIA_API_KEY is not
  // configured. Ambiguous messages fall through to the model, which also has
  // these details in BASE_SYSTEM_PROMPT.
  const contactKind = detectContactIntent(userMessage);
  if (contactKind) {
    const contactAnswer = contactReply(contactKind);
    if (supabase) {
      const cSid =
        body?.sessionId ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
      const cUser = body?.userEmail || body?.sessionId || 'visitor';
      Promise.resolve(
        supabase.from('chat_logs').insert([
          { session_id: cSid, user_identifier: cUser, role: 'user', content: userMessage, model: 'canned-contact' },
          { session_id: cSid, user_identifier: cUser, role: 'assistant', content: contactAnswer, model: 'canned-contact' },
        ]),
      )
        .then(() => {})
        .catch((err) => console.error('chat_logs insert failed:', err.message));
    }
    return { status: 200, data: { content: contactAnswer } };
  }

  if (!nvidiaConfigured()) {
    return { status: 503, data: { message: 'AI not configured', fallback: true } };
  }

  const leadershipIntent = isLeadershipMessage(userMessage);
  const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];
  const ctx = await buildBusinessContext(supabase);
  const systemPrompt = formatBusinessContext(ctx);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, 1000),
    })),
    ...(leadershipIntent
      ? [
          {
            role: 'system',
            content:
              'IMPORTANT — LEADERSHIP QUESTION: The visitor is asking about company leadership. ' +
              `Answer using ONLY this verified fact: ${CEO_NAME} is the ${CEO_ROLE} of Alpha Premier Group of Companies / Alpha Premier Realty. ` +
              'Do NOT invent education, past roles, age, personal background, net worth, or any other detail not stated here. ' +
              "If asked for details you don't have, say you can connect them with our office. " +
              'Keep it warm, professional, and concise (under ~80 words).',
          },
        ]
      : []),
    { role: 'user', content: userMessage },
  ];

  let assistantContent = '';
  try {
    assistantContent = await nvidiaChat(messages, {
      temperature: leadershipIntent ? 0.2 : 0.5,
      max_tokens: 400,
    });

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

    // ---- Lead capture: check for [LEAD] marker from AI and persist to inquiries ----
    const leadMatch = assistantContent.match(/\[LEAD\](.*?)\[\/LEAD\]/);
    if (leadMatch) {
      const fields = leadMatch[1].split('|').map(f => f.trim());
      // fields: [name, contact, property_type, location, budget, schedule]
      const leadName = fields[0] || '';
      const leadContact = fields[1] || '';
      const leadPropertyType = fields[2] || '';
      const leadLocation = fields[3] || '';
      const leadBudget = fields[4] || '';
      const leadSchedule = fields[5] || '';

      // Build a descriptive message from collected fields
      const leadMessage = [
        leadPropertyType ? `Property type: ${leadPropertyType}` : '',
        leadLocation ? `Location: ${leadLocation}` : '',
        leadBudget ? `Budget: ${leadBudget}` : '',
        leadSchedule ? `Schedule: ${leadSchedule}` : '',
      ].filter(Boolean).join('. ') || 'Lead collected via chatbot conversation.';

      if (leadName && leadContact && supabase) {
        const email = leadContact.includes('@') ? leadContact : '';
        const phone = !email ? leadContact : '';
        const ticket = 'APR-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.random().toString(36).slice(2,6).toUpperCase();

        Promise.resolve(supabase.from('inquiries').insert({
          ticket,
          name: leadName,
          email: email || null,
          phone: phone || null,
          subject: `Chatbot Lead: ${leadPropertyType || 'Property Inquiry'}`,
          message: leadMessage,
          source: 'chatbot',
          status: 'new',
        })).then(() => {}).catch(err => console.error('lead insert failed:', err.message));
      }
    }

    // Strip the lead marker from the visible response
    assistantContent = assistantContent.replace(/\[LEAD\].*?\[\/LEAD\]/g, '').trim();

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
