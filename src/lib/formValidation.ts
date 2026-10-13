/**
 * Field validators shared by every public form. Each returns a short user-facing message, or null
 * when the value is valid. Input is trimmed first. Server mirror: api/lib/Validation.php (keep the
 * rules and messages identical).
 */

const NAME_CHARS = /^[\p{L}\p{M} .'’-]+$/u;
const LETTER = /\p{L}/gu;
const EMAIL = /^[^\s@]+@(?:[^\s@.]+\.)+[A-Za-z]{2,}$/;
const PHONE_CHARS = /^[\d\s+().-]+$/;

export function nameError(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Name is required.';
  if (v.length < 2) return 'Name must be at least 2 characters.';
  if (v.length > 100) return 'Name must be 100 characters or fewer.';
  if (!NAME_CHARS.test(v)) return 'Name can only contain letters, spaces, periods, apostrophes and hyphens.';
  if ((v.match(LETTER) ?? []).length < 2) return 'Name must contain at least 2 letters.';
  return null;
}

export function emailError(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Email is required.';
  if (v.length > 254) return 'Email must be 254 characters or fewer.';
  if (!EMAIL.test(v)) return 'Enter a valid email address, e.g. name@example.com.';
  return null;
}

export function phoneError(value: string, required = true): string | null {
  const v = value.trim();
  if (!v) return required ? 'Phone number is required.' : null;
  if (!PHONE_CHARS.test(v)) return 'Phone number can only contain digits, spaces, +, (, ), - and periods.';
  if (v.lastIndexOf('+') > 0) return 'A + is only allowed at the start of the phone number.';
  const digits = v.replace(/\D/g, '').length;
  if (digits < 7 || digits > 15) return 'Phone number must have 7 to 15 digits.';
  return null;
}

export function textError(
  value: string,
  opts: { label: string; required?: boolean; min?: number; max?: number },
): string | null {
  const v = value.trim();
  if (!v) return opts.required ? `${opts.label} is required.` : null;
  if (opts.min !== undefined && v.length < opts.min) return `${opts.label} must be at least ${opts.min} characters.`;
  if (opts.max !== undefined && v.length > opts.max) return `${opts.label} must be ${opts.max} characters or fewer.`;
  return null;
}

export function urlError(value: string, required = false): string | null {
  const v = value.trim();
  if (!v) return required ? 'URL is required.' : null;
  if (v.length > 500) return 'URL must be 500 characters or fewer.';
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return 'Enter a valid URL starting with http:// or https://.';
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname.includes('.')) {
    return 'Enter a valid URL starting with http:// or https://.';
  }
  return null;
}
