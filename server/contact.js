// server/contact.js
// Simple Node.js HTTP server that sends contact form emails via Resend API
// Run: node server/contact.js
// Called by the Vite React app via proxy on /api/contact

import { Resend } from 'resend';
import http from 'http';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_RSgaSKBM_777WZr1hDnXV8Y1BbTPSmBN9';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'alphapremierrealty@gmail.com';
const PORT = process.env.PORT || 3001;

const resend = new Resend(RESEND_API_KEY);

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(null);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    sendJSON(res, 200, {});
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/contact') {
    sendJSON(res, 404, { success: false, message: 'Not found' });
    return;
  }

  const data = await parseBody(req);
  if (!data || !data.name || !data.email || !data.message) {
    sendJSON(res, 400, { success: false, message: 'Name, email, and message are required.' });
    return;
  }

  const { name, email, subject, message } = data;
  const ticketNumber = `APR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: 'Alpha Premier Group <onboarding@resend.dev>',
      to: [COMPANY_EMAIL],
      replyTo: email,
      subject: subject
        ? `Contact Form: ${subject} [Ticket: ${ticketNumber}]`
        : `New Contact Form Inquiry from ${name} [Ticket: ${ticketNumber}]`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #222; background: #fff; margin: 0; padding: 0; }
            .header { background: #111; border-bottom: 3px solid #E3B66C; padding: 32px 20px 18px; text-align: center; }
            .company-name { font-family: 'Arial Black', sans-serif; font-size: 1.8rem; font-weight: 900; color: #E3B66C; letter-spacing: 2px; }
            .inquiry-title { font-size: 1.1rem; font-weight: 700; color: #fff; margin-top: 8px; }
            .content { padding: 28px 20px; }
            .section { background: #fff; color: #111; padding: 15px; border: 1.5px solid #111; border-left: 5px solid #E3B66C; margin: 15px 0; border-radius: 8px; }
            .label { font-weight: bold; color: #E3B66C; }
            .footer { background: #111; color: #E3B66C; padding: 15px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">ALPHA PREMIER</div>
            <div class="inquiry-title">Website Contact Form Inquiry</div>
          </div>
          <div class="content">
            <div style="font-size:1rem;font-weight:700;color:#E3B66C;margin-bottom:18px;">Ticket #: ${ticketNumber}</div>
            <div class="section">
              <h3>Contact Information</h3>
              <p><span class="label">Name:</span> ${escapeHtml(name)}</p>
              <p><span class="label">Email:</span> ${escapeHtml(email)}</p>
              ${subject ? `<p><span class="label">Subject:</span> ${escapeHtml(subject)}</p>` : ''}
            </div>
            <div class="section">
              <h3>Message</h3>
              <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div class="footer">
            <p>Alpha Premier Group — ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      sendJSON(res, 500, { success: false, message: 'Failed to send message.' });
      return;
    }

    console.log(`Email sent: ${ticketNumber} from ${email}`);
    sendJSON(res, 200, {
      success: true,
      message: 'Thank you! Your message has been sent.',
      ticket: ticketNumber,
    });
  } catch (err) {
    console.error('Server error:', err);
    sendJSON(res, 500, { success: false, message: 'Internal server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`Contact API server running on http://localhost:${PORT}`);
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

