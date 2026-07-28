import { Resend } from 'resend';
import { createServerSupabase, readServerConfig } from './config.js';

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function ticketId() {
  return `APR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function handleContact(body, { supabase = createServerSupabase(), config = readServerConfig() } = {}) {
  if (!body?.name || !body?.email || !body?.message) {
    return { status: 400, data: { success: false, message: 'Name, email, and message required.' } };
  }
  const ticket = ticketId();
  if (supabase) {
    const { error } = await supabase.from('inquiries').insert({
      ticket,
      name: String(body.name).trim(),
      email: String(body.email).trim(),
      phone: body.phone || null,
      subject: body.subject || null,
      message: String(body.message).trim(),
      source: body.source || 'contact_form',
      property_id: body.property_id || null,
      status: 'new',
    });
    if (error) return { status: 503, data: { success: false, message: 'Inquiry could not be saved.' } };
  }
  if (!config.resendApiKey) {
    return { status: 200, data: { success: true, message: 'Inquiry received.', ticket } };
  }
  const resend = new Resend(config.resendApiKey);
  const result = await resend.emails.send({
    from: 'Alpha Premier Group <onboarding@resend.dev>',
    to: [config.companyEmail],
    replyTo: body.email,
    subject: body.subject ? `Contact Form: ${body.subject} [${ticket}]` : `New Inquiry from ${body.name} [${ticket}]`,
    html: `<p>Ticket: ${escapeHtml(ticket)}</p><p>Name: ${escapeHtml(body.name)}</p><p>Email: ${escapeHtml(body.email)}</p><p>Message: ${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>`,
  });
  if (result.error) return { status: 503, data: { success: false, message: 'Failed to send email.' } };
  return { status: 200, data: { success: true, message: 'Message sent!', ticket } };
}
