/**
 * Cloudflare Turnstile bot check for the public forms. Invisible for normal visitors;
 * only suspicious traffic gets a one-click checkbox (bottom-right). Without
 * VITE_TURNSTILE_SITE_KEY at build time it returns '' and the server skips the check.
 */
interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance: 'interaction-only';
      callback: (token: string) => void;
      'error-callback': () => void;
      'timeout-callback': () => void;
    },
  ): string;
  remove(widgetId: string): void;
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '';
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FAILED = 'Security check failed. Please refresh the page and try again.';

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
      if (api) resolve(api);
      else reject(new Error(FAILED));
    };
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error(FAILED));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Resolves a single-use token to send as `turnstile_token`; rejects with a user-facing message. */
export async function getTurnstileToken(): Promise<string> {
  if (!SITE_KEY) return '';
  const turnstile = await loadTurnstile();

  return new Promise<string>((resolve, reject) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647';
    document.body.appendChild(host);

    let widgetId = '';
    const finish = (settle: () => void) => {
      if (widgetId) turnstile.remove(widgetId);
      host.remove();
      settle();
    };

    widgetId = turnstile.render(host, {
      sitekey: SITE_KEY,
      appearance: 'interaction-only',
      callback: (token) => finish(() => resolve(token)),
      'error-callback': () => finish(() => reject(new Error(FAILED))),
      'timeout-callback': () => finish(() => reject(new Error(FAILED))),
    });
  });
}
