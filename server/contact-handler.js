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
    html: `<p>Ticket: ${escapeHtml(ticket)}</p><p>Name: ${escapeHtml(body.name)}</p><p>Email: ${escapeHtml(body.email)}</p><p>Phone: ${escapeHtml(body.phone || 'N/A')}</p><p>Message: ${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>`,
  });
  if (result.error) return { status: 503, data: { success: false, message: 'Failed to send email.' } };
  return { status: 200, data: { success: true, message: 'Message sent!', ticket } };
}

export async function handleCareerApply(body, { supabase = createServerSupabase(), config = readServerConfig() } = {}) {
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim();
  const phone = String(body?.phone || '').trim();
  const role = String(body?.role || body?.position || 'General Application').trim();
  const message = String(body?.message || body?.coverLetter || '').trim();
  const resumeBase64 = body?.resumeBase64;
  const resumeFileName = body?.resumeFileName || 'resume.pdf';
  const resumeMime = body?.resumeMime || 'application/pdf';

  if (!name || !email) {
    return { status: 400, data: { success: false, message: 'Name and email are required for job application.' } };
  }

  const ticket = ticketId();
  let resumeStoragePath = null;

  if (supabase && resumeBase64) {
    try {
      const buffer = Buffer.from(resumeBase64.replace(/^data:.*?;base64,/, ''), 'base64');
      const safeName = resumeFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      resumeStoragePath = `resumes/${ticket}_${safeName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('applicant-resumes')
        .upload(resumeStoragePath, buffer, {
          contentType: resumeMime,
          upsert: true,
        });
      
      if (uploadError) {
        console.warn('Resume upload to applicant-resumes failed:', uploadError.message);
      }
    } catch (e) {
      console.warn('Resume parse/upload error:', e.message);
    }
  }

  if (supabase) {
    const fullMessage = [
      `Position Applied: ${role}`,
      phone ? `Phone: ${phone}` : '',
      resumeStoragePath ? `Resume Path: ${resumeStoragePath}` : (resumeFileName ? `Resume Attached: ${resumeFileName}` : ''),
      message ? `Cover Letter / Note:\n${message}` : '',
    ].filter(Boolean).join('\n\n');

    const { error: dbErr } = await supabase.from('inquiries').insert({
      ticket,
      name,
      email,
      phone: phone || null,
      subject: `Career Application: ${role}`,
      message: fullMessage,
      source: 'career_application',
      status: 'new',
    });

    if (dbErr) {
      console.error('Job application DB error:', dbErr.message);
      return { status: 503, data: { success: false, message: 'Application could not be recorded.' } };
    }
  }

  if (!config.resendApiKey) {
    return { status: 200, data: { success: true, message: 'Application submitted successfully.', ticket } };
  }

  try {
    const resend = new Resend(config.resendApiKey);
    await resend.emails.send({
      from: 'Alpha Premier Careers <onboarding@resend.dev>',
      to: [config.companyEmail],
      replyTo: email,
      subject: `[Career Application] ${role} — ${name} [${ticket}]`,
      html: `
        <h2>New Career Application</h2>
        <p><strong>Ticket ID:</strong> ${escapeHtml(ticket)}</p>
        <p><strong>Candidate:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || 'N/A')}</p>
        <p><strong>Position:</strong> ${escapeHtml(role)}</p>
        ${resumeStoragePath ? `<p><strong>Resume:</strong> Stored in <code>applicant-resumes/${escapeHtml(resumeStoragePath)}</code></p>` : ''}
        <p><strong>Notes:</strong></p>
        <p>${escapeHtml(message || 'No additional notes provided.').replace(/\n/g, '<br>')}</p>
      `,
    });
  } catch (err) {
    console.error('Resend email error on career apply:', err.message);
  }

  return { status: 200, data: { success: true, message: 'Application submitted successfully!', ticket } };
}
