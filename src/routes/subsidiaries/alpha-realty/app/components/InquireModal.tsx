import React from 'react';
import { Mail, MapPin, Phone, X } from 'lucide-react';
import { useModalDialog } from '@/hooks/useModalDialog';
import { useContent } from '@/hooks/useContent';
import { useSiteSettings, companyContact, phoneParts, telHref, addressOneLine } from '@/hooks/useSiteSettings';
import AlphaPremierLogo from './AlphaPremierLogo';
import { InquiryForm } from './InquiryForm';
import { EYEBROW, GOLD_ACCENT, MODAL_CLOSE, MODAL_OVERLAY, MODAL_PANEL } from './ui';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  /** A service the visitor picked (Services page); the heading names it and the inquiry is about it. */
  serviceTitle?: string;
}

/**
 * Realty's inquiry popup (home, services, "Request a property" and /inquire): the shared InquiryForm, with the
 * desk's contact details beside it (below it on phones). A listing's own inquiry opens beside its photos
 * instead (ListingView). Mounted only while open, so every open starts a fresh form.
 */
export default function InquireModal({ isOpen, onClose, onSubmitSuccess, serviceTitle }: InquireModalProps) {
  // Copy: content page 'realty'; desk phone/email/address: Site settings (Alpha Premier Realty).
  const { content } = useContent('realty');
  const contact = companyContact(useSiteSettings(), 'realty');
  const dialogRef = useModalDialog<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className={MODAL_OVERLAY}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="realty-inquire-title"
        tabIndex={-1}
        className={`${MODAL_PANEL} max-w-4xl`}
      >
        {/* Outside the scroller so it stays reachable while the form scrolls on phones. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inquiry form"
          className={MODAL_CLOSE}
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="grid w-full overflow-y-auto overscroll-contain md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          <div className="p-5 pt-6 sm:p-8 md:order-last">
            <p className={EYEBROW}>
              <span aria-hidden="true" className="h-px w-8 bg-[#c5a85c]" />
              Inquiry
            </p>
            {/* Focus starts on the heading (no keyboard popping up on phones, no ring until Tab). */}
            <h2
              id="realty-inquire-title"
              tabIndex={-1}
              data-autofocus
              className="mt-3 pr-10 text-balance font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-tight text-white outline-none"
            >
              {serviceTitle ? (
                <>
                  Inquire About <span className={GOLD_ACCENT}>{serviceTitle}</span>
                </>
              ) : (
                <>
                  Tell Us What You <span className={GOLD_ACCENT}>Need</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-sm text-white/55">An advisor will get back to you within one business day.</p>
            <div className="mt-6">
              <InquiryForm
                subject={serviceTitle ? { title: serviceTitle } : undefined}
                onSent={() => {
                  onSubmitSuccess();
                  onClose();
                }}
              />
            </div>
          </div>

          <aside className="flex flex-col justify-between gap-8 border-t border-white/10 bg-[radial-gradient(130%_80%_at_0%_0%,rgba(197,168,92,0.14),transparent_60%),linear-gradient(180deg,#0f0f11,#09090b)] p-6 sm:p-8 md:border-r md:border-t-0">
            <div>
              <AlphaPremierLogo className="-ml-3 h-14 w-auto" />
              <div aria-hidden="true" className="mt-5 h-px w-12 bg-[#c5a85c]/60" />
              <p className="mt-5 text-lg font-light leading-snug text-white">{String(content.inquiry_title ?? '')}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{String(content.inquiry_text ?? '')}</p>
            </div>
            <ul className="space-y-3 text-xs text-white/65">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#c5a85c]" aria-hidden="true" />
                <span>{addressOneLine(contact.address)}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-[#c5a85c]" aria-hidden="true" />
                <span className="flex flex-wrap gap-x-2 gap-y-1 tabular-nums">
                  {phoneParts(contact.phone).map((phone) => (
                    <a key={phone} href={telHref(phone)} className="rounded transition-colors hover:text-[#e6cd86]">
                      {phone}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-[#c5a85c]" aria-hidden="true" />
                <a href={`mailto:${contact.email}`} className="min-w-0 break-all rounded transition-colors hover:text-[#e6cd86]">
                  {contact.email}
                </a>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
