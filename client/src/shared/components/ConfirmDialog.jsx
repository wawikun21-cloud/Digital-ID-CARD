import { useEffect, useRef } from 'react';

/**
 * A centered modal confirmation dialog — the app's replacement for
 * window.confirm(), so it can be styled to match and each caller can
 * word its own buttons ("Log out", "Delete") instead of "OK"/"Cancel".
 * Purely presentational; rendered once by ConfirmProvider. Use
 * useConfirm() to open it from anywhere.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'default',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // Remember the trigger, move focus to the confirm button, hand focus back on close.
  useEffect(() => {
    if (!open) return undefined;

    lastFocusedRef.current = document.activeElement;
    confirmRef.current?.focus({ preventScroll: true });

    return () => {
      const target = lastFocusedRef.current;
      if (target instanceof HTMLElement && document.contains(target)) {
        target.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Escape cancels; Tab stays inside the dialog.
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  // Stop the page behind from scrolling while the dialog is up.
  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const confirmClasses =
    tone === 'danger'
      ? 'bg-maroon-light text-paper hover:bg-maroon-light/90'
      : 'bg-ink text-paper hover:bg-ink/90';

  return (
    <>
      <div
        onClick={onCancel}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby={message ? 'confirm-dialog-message' : undefined}
          tabIndex={-1}
          inert={open ? undefined : true}
          className={`w-full max-w-sm rounded-2xl border border-line bg-paper p-5 shadow-2xl transition-transform duration-200 ${
            open ? 'scale-100' : 'scale-95'
          }`}
        >
          <h2 id="confirm-dialog-title" className="font-serif text-lg font-semibold text-ink">
            {title}
          </h2>
          {message && (
            <p id="confirm-dialog-message" className="mt-2 text-sm text-ink-soft">
              {message}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${confirmClasses}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}