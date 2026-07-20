// api/contact.js — Vercel serverless function for contact form submissions
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { readBody } from '../server/http.js';

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});

  if (req.method !== 'POST') return sendJSON(res, 405, { success: false, message: 'Method not allowed' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const companyEmail = process.env.COMPANY_EMAIL || 'alphapremierrealty@gmail.com';

  const supabase = supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;

  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  const body = (await readBody(req)) || {};
  if (!body.name || !body.email || !body.message) {
    return sendJSON(res, 400, { success: false, message: 'Name, email, and message required.' });
  }

  const ticket = 'APR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

  if (supabase) {
    try {
      await supabase.from('inquiries').insert({
        ticket, name: body.name, email: body.email, phone: body.phone || null,
        subject: body.subject || null, message: body.message, source: body.source || 'contact_form',
        property_id: body.property_id || null, status: 'new',
      });
    } catch (err) { console.error('Inquiry persist error (non-blocking):', err); }
  }

  if (!resend) {
    return sendJSON(res, 200, { success: true, message: 'Inquiry received (email disabled).', ticket });
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Alpha Premier Group <onboarding@resend.dev>',
      to: [companyEmail], replyTo: body.email,
      subject: body.subject ? `Contact Form: ${body.subject} [${ticket}]` : `New Inquiry from ${body.name} [${ticket}]`,
      html: '<p>Ticket: ' + escapeHtml(ticket) + '</p><p>Name: ' + escapeHtml(body.name) + '</p><p>Email: ' + escapeHtml(body.email) + '</p><p>Message: ' + escapeHtml(body.message).replace(/\n/g, '<br>') + '</p>',
    });
    if (error) { console.error('Resend error:', error); return sendJSON(res, 500, { success: false, message: 'Failed to send email.' }); }
    sendJSON(res, 200, { success: true, message: 'Message sent!', ticket });
  } catch (err) {
    console.error('Server error:', err);
    sendJSON(res, 500, { success: false, message: 'Internal error.' });
  }
}
