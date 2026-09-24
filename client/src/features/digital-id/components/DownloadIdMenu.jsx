import { useEffect, useId, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { DownloadIcon } from '../../../shared/components/icons';
import DigitalIdBack from './DigitalIdBack';
import DigitalIdFront from './DigitalIdFront';
import {
  FACE_HEIGHT,
  FACE_WIDTH,
  downloadDigitalIdPdf,
  downloadDigitalIdPng,
  exportFileBase,
} from '../utils/exportDigitalId';

const FORMATS = {
  png: { label: 'PNG image', hint: 'Front and back, for sharing', run: downloadDigitalIdPng },
  pdf: { label: 'PDF (print size)', hint: 'Two pages, CR80 card size', run: downloadDigitalIdPdf },
};

/**
 * "Download ID" button with a PNG / PDF choice. The card faces are
 * rendered off-screen at their native size only while an export runs,
 * so nothing extra sits in the page (or re-renders while editing).
 */
export default function DownloadIdMenu({ digitalId }) {
  const menuId = useId();
  const rootRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [staged, setStaged] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function handleExport(format) {
    setOpen(false);
    setError(null);
    setBusy(format);
    try {
      flushSync(() => setStaged(true)); // mount the faces now so the refs exist
      await FORMATS[format].run([frontRef.current, backRef.current], exportFileBase(digitalId.name));
    } catch (exportError) {
      console.error(exportError);
      setError('Could not create the download. Please try again.');
    } finally {
      setStaged(false);
      setBusy(null);
    }
  }

  return (
    <div ref={rootRef} className="relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={Boolean(busy)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft shadow-sm transition hover:border-gold/60 hover:text-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60"
      >
        <DownloadIcon />
        {busy ? 'Preparing…' : 'Download ID'}
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-lg"
        >
          {Object.entries(FORMATS).map(([key, { label, hint }]) => (
            <li key={key} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => handleExport(key)}
                className="flex w-full flex-col items-start px-4 py-2 text-left transition hover:bg-line/40 focus-visible:bg-line/40 focus-visible:outline-none"
              >
                <span className="text-sm font-medium text-ink">{label}</span>
                <span className="text-xs text-ink-soft">{hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-center text-xs font-medium text-maroon-light">
          {error}
        </p>
      )}

      {staged &&
        createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed top-0"
            style={{ left: -10000 }}
          >
            <div ref={frontRef} style={{ width: FACE_WIDTH, height: FACE_HEIGHT }}>
              <DigitalIdFront digitalId={digitalId} interactive={false} />
            </div>
            <div ref={backRef} style={{ width: FACE_WIDTH, height: FACE_HEIGHT }}>
              <DigitalIdBack digitalId={digitalId} interactive={false} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}