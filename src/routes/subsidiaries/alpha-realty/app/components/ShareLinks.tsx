import React, { useState } from 'react';
import { Check, Facebook, Link2 } from 'lucide-react';

const pill = 'inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:border-[#c5a85c]/60 hover:text-white cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#c5a85c]';

/**
 * "Share on Facebook" (Facebook's share dialog, where staff can post to the Alpha Premier Realty Page)
 * and "Copy link" (for Viber) for a page's public URL. The page's head tags give the share its preview.
 */
export function ShareLinks({ url, className = '' }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, () => setCopied(false));
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={pill}>
        <Facebook className="size-3.5" aria-hidden="true" /> Share on Facebook<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <button type="button" onClick={copy} className={pill}>
        {copied ? <Check className="size-3.5 text-[#c5a85c]" aria-hidden="true" /> : <Link2 className="size-3.5" aria-hidden="true" />}
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Link copied' : ''}</span>
    </div>
  );
}
