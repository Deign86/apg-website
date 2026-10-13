import { useCallback, useId, useRef, useState } from 'react';
import type { FocusEvent } from 'react';

type Rule = (value: string) => string | null;

/**
 * Inline field validation for a public form, driven by the rules in src/lib/formValidation.ts.
 *
 * Spread `field(key)` on each control (a focus ref, aria-invalid, aria-describedby and a re-check on
 * blur), render the message from `errors[key]` with `id={errorId(key)}`, call `recheck(key, value)` from
 * the control's change handler, and gate submission on `validate(values)`, which shows every error and
 * focuses the first invalid control. A field is only re-checked live once it has shown an error.
 */
export function useFieldErrors<K extends string>(rules: Record<K, Rule>) {
  const prefix = useId();
  // A key that is present has been shown an error; null means it has since been fixed.
  const [shown, setShown] = useState<Partial<Record<K, string | null>>>({});
  const controls = useRef<Partial<Record<K, HTMLElement | null>>>({});
  // SAFETY: `rules` is a Record<K, Rule> literal, so its own keys are exactly K.
  const keys = Object.keys(rules) as K[];
  const errorId = (key: K) => `${prefix}${key}-error`;

  const validate = (values: Record<K, string>): boolean => {
    const next: Partial<Record<K, string | null>> = {};
    for (const key of keys) next[key] = rules[key](values[key] ?? '');
    setShown(next);
    const first = keys.find((key) => next[key]);
    if (first) controls.current[first]?.focus();
    return first === undefined;
  };

  const isField = (key: string): key is K => key in rules;

  /** Accepts any control name (e.g. from a shared change handler); names without a rule are ignored. */
  const recheck = (key: string, value: string) => {
    if (!isField(key)) return;
    const message = rules[key](value);
    setShown((prev) => (key in prev && prev[key] !== message ? { ...prev, [key]: message } : prev));
  };

  const reset = useCallback(() => setShown({}), []);

  const field = (key: K) => ({
    ref: (el: HTMLElement | null) => {
      controls.current[key] = el;
    },
    'aria-invalid': shown[key] ? true : undefined,
    'aria-describedby': shown[key] ? errorId(key) : undefined,
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => recheck(key, e.currentTarget.value),
  });

  return { errors: shown, validate, recheck, reset, field, errorId };
}
