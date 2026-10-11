import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { submitPublicForm } from '@/lib/publicForm';

export type NewsletterStatus = 'idle' | 'sending' | 'done' | 'error';

/**
 * Newsletter sign-up for any site's subscribe box. Posts to api/inquire.php as form=newsletter,
 * which emails the team the new subscriber and sends the visitor a branded confirmation.
 *
 * @param enterprise Canonical enterprise slug (sets the email branding), e.g. 'corporate'.
 */
export function useNewsletter(enterprise: string) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<NewsletterStatus>('idle');
  const [error, setError] = useState('');
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const subscribe = async (e?: FormEvent) => {
    e?.preventDefault();
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setStatus('error');
      setError('Please enter a valid email address.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await submitPublicForm({ form: 'newsletter', email: address, enterprise }, startedAt.current);
      setStatus('done');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Subscription failed. Please try again.');
    }
  };

  return { email, setEmail, status, error, subscribe };
}
