import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    root.dataset.modalOpen = 'true'; // lets fixed overlays (chat launcher) step aside
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
      root.style.overflow = prevOverflow;
      delete root.dataset.modalOpen;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return ref;
}
