import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open dialogs share one page lock: when one dialog hands off to another (listing → inquiry),
// the closing one's cleanup runs after the new one opened, so the lock is reference-counted.
let openDialogs = 0;
let overflowBeforeLock = '';

/**
 * Modal behaviour for the hand-built overlay dialogs: while `isOpen`, Escape
 * calls `onClose`, Tab cycles inside the dialog, page scroll is locked, focus
 * moves into the dialog and returns to the opener on close.
 *
 * Scroll is locked on <html> (the scrolling element): global.css gives <html>
 * `overflow-x: hidden`, so `overflow: hidden` on <body> would not stop the page.
 */
export function useModalDialog<T extends HTMLElement>(isOpen: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const node = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    if (openDialogs === 0) {
      overflowBeforeLock = root.style.overflow;
      root.style.overflow = 'hidden';
      root.dataset.modalOpen = 'true'; // lets fixed overlays (chat launcher, enterprise header) step aside
    }
    openDialogs += 1;
    (node?.querySelector<HTMLElement>(FOCUSABLE) ?? node)?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !node.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openDialogs -= 1;
      if (openDialogs === 0) {
        root.style.overflow = overflowBeforeLock;
        delete root.dataset.modalOpen;
      }
      // Don't pull focus out of a dialog that opened as this one closed.
      const focusInDialog = document.activeElement?.closest('[aria-modal="true"]');
      if (opener?.isConnected && !focusInDialog) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return ref;
}
