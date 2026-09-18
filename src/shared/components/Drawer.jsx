import { useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

/**
 * A slide-over editor panel.
 *
 * Responsive by shape, not just by width: on phones it's a bottom
 * sheet that rises from the edge of the thumb's reach, capped at 88svh
 * so the card behind stays partly visible; from `sm` up it becomes a
 * full-height side panel on the right. Same component, same behaviour,
 * two idioms.
 *
 * Kept generic — it knows nothing about Digital IDs, only how to open,
 * close and behave itself while open. The panel stays mounted when
 * closed so the slide animation has something to animate, and is marked
 * `inert` so its contents can't be tabbed into or read by a screen
 * reader while hidden.
 *
 * Handles the things a hand-rolled drawer usually forgets: Escape to
 * close, a backdrop that closes on click, body scroll lock, focus moved
 * into the panel on open, focus returned to the trigger on close, and
 * Tab wrapped inside the panel so it can't wander behind the backdrop.
 */
export default function Drawer({ open, onClose, title, description, children }) {
  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // Remember the trigger, move focus in, and hand it back on close.
  useEffect(() => {
    if (!open) return undefined;

    lastFocusedRef.current = document.activeElement;
    const panel = panelRef.current;
    panel?.focus({ preventScroll: true });

    return () => {
      const target = lastFocusedRef.current;
      if (target instanceof HTMLElement && document.contains(target)) {
        target.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Escape closes; Tab stays inside the panel.
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll(
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
  }, [open, onClose]);

  // Stop the page behind from scrolling while the drawer is up.
  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        inert={open ? undefined : true}
        className={[
          // Mobile: bottom sheet.
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col rounded-t-2xl border-t border-line',
          // sm and up: full-height right-hand panel.
          'sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0',
          'bg-cream shadow-2xl outline-none transition-transform duration-300 ease-out',
          open
            ? 'translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-x-full sm:translate-y-0',
        ].join(' ')}
      >
        {/* Grab-handle affordance — sheets read as draggable on touch. */}
        <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>

        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line bg-paper px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1 text-xs text-ink-soft">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-gold/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          {children}
        </div>
      </aside>
    </>
  );
}
