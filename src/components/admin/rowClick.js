// Controls inside a row keep their own click (status selects, toggles, links, icon buttons).
const ROW_CONTROLS = 'a,button,input,select,textarea,label,summary,[role="menu"]';

/**
 * Row onClick body: opens the row from anywhere on it, `onClick={(e) => openOnRowClick(e, () => open(row))}`.
 * Mouse convenience only: each row keeps its own Edit/Open button as the keyboard control. A click on
 * one of the row's controls, or one that ends a text selection (copying an email, a ref), is ignored.
 */
export function openOnRowClick(e, open) {
  if (e.target.closest(ROW_CONTROLS)) return;
  if (window.getSelection?.()?.toString()) return;
  open();
}
