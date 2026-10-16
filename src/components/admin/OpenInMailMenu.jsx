import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Mail } from 'lucide-react';

// mailto: only works where a desktop mail app is set up, so the web mailboxes come first: each opens
// its compose window in a new tab with the recipient and subject filled in.
const MAIL_APPS = [
  { label: 'Gmail', href: (to, su) => `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}` },
  { label: 'Outlook (work or school)', href: (to, su) => `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${su}` },
  { label: 'Outlook.com', href: (to, su) => `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}` },
  { label: 'Yahoo Mail', href: (to, su) => `https://compose.mail.yahoo.com/?to=${to}&subject=${su}` },
  { label: 'Default mail app', href: (to, su) => `mailto:${to}?subject=${su}`, local: true },
];

/** "Open in mail app" with a choice of mailbox; `compact` renders it as a text link. */
export default function OpenInMailMenu({ email, subject, label, compact = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const to = encodeURIComponent(email);
  const su = encodeURIComponent(subject);

  return (
    <div className={`mail-menu${compact ? ' mail-menu-compact' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={compact ? 'inquiries-link inquiries-sub mail-menu-link' : 'admin-btn admin-btn-ghost'}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Mail size={compact ? 13 : 14} aria-hidden="true" /> {label}
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      {open && (
        <ul className="mail-menu-list" role="menu" aria-label="Open the reply in">
          {MAIL_APPS.map((app) => (
            <li key={app.label} role="none">
              <a
                role="menuitem"
                href={app.href(to, su)}
                target={app.local ? undefined : '_blank'}
                rel={app.local ? undefined : 'noopener noreferrer'}
                onClick={() => setOpen(false)}
              >
                {app.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
