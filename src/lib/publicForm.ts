import { getTurnstileToken } from '@/lib/turnstile';

/**
 * POSTs a public form to api/inquire.php with the anti-spam fields the server requires
 * (honeypot, form start time, Turnstile token). Throws with the server's message on failure.
 *
 * @param body       Form fields, e.g. { form: 'feedback', name, email, enterprise, message }.
 * @param startedAt  Date.now() captured when the form was first shown.
 */
export async function submitPublicForm(body: Record<string, string | number>, startedAt: number): Promise<{ ticket?: string }> {
  const res = await fetch('/api/inquire.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      website: '',
      form_started_at: startedAt,
      turnstile_token: await getTurnstileToken(),
    }),
  });
  // api/inquire.php answers { success, error?, ticket? }; anything else counts as a failure.
  const data: { success?: unknown; error?: unknown; ticket?: unknown } = await res.json().catch(() => ({}));
  if (!res.ok || data.success !== true) {
    throw new Error(data.error ? String(data.error) : 'Submission failed. Please try again.');
  }
  return { ticket: data.ticket ? String(data.ticket) : undefined };
}
