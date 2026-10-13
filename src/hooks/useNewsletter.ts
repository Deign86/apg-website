import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { emailError } from '@/lib/formValidation';
import { submitPublicForm } from '@/lib/publicForm';

export type NewsletterStatus = 'idle' | 'sending' | 'done' | 'error';

/**
 * Newsletter sign-up for any site's subscribe box. Posts to api/inquire.php as form=newsletter,
 * which emails the team the new subscriber and sends the visitor a branded confirmation.
 *
 * Spread `inputProps` on the email input (id, type, autocomplete, aria wiring, focus target) and give
 * the element that shows `error` the id `errorId`. An invalid address blocks the request, is shown
 * as `error`, and is re-checked as the visitor types.
 *
 * @param enterprise Canonical enterprise slug (sets the email branding), e.g. 'corporate'.
 */
export function useNewsletter(enterprise: string) {
  const [email, setEmailValue] = useState('');
  const [status, setStatus] = useState<NewsletterStatus>('idle');
  const [error, setError] = useState('');
  const [invalid, setInvalid] = useState(false);
  const startedAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const errorId = `${id}-error`;
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const showFieldError = (message: string | null) => {
    setInvalid(message !== null);
    setStatus(message ? 'error' : 'idle');
    setError(message ?? '');
  };

  const setEmail = (value: string) => {
    setEmailValue(value);
    if (invalid) showFieldError(emailError(value));
  };

  const subscribe = async (e?: FormEvent) => {
    e?.preventDefault();
    const address = email.trim();
    const message = emailError(address);
    if (message) {
      showFieldError(message);
      inputRef.current?.focus();
      return;
    }
    setInvalid(false);
    setStatus('sending');
    setError('');
    try {
      await submitPublicForm({ form: 'newsletter', email: address, enterprise }, startedAt.current);
      setStatus('done');
      setEmailValue('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Subscription failed. Please try again.');
    }
  };

  const inputProps = {
    ref: inputRef,
    id,
    name: 'email',
    type: 'email',
    inputMode: 'email' as const,
    autoComplete: 'email',
    required: true,
    maxLength: 254,
    'aria-invalid': invalid || undefined,
    'aria-describedby': status === 'error' ? errorId : undefined,
    onBlur: () => {
      if (invalid) showFieldError(emailError(email));
    },
  };

  return { email, setEmail, status, error, subscribe, inputProps, errorId };
}
