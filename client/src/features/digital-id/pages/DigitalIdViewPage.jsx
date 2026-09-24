import { useEffect, useState } from 'react';
import DigitalIdCard from '../components/DigitalIdCard';
import { ShieldCheckIcon } from '../../../shared/components/icons';
import { fetchDigitalId } from '../services/digitalIdService';

/**
 * Public, read-only view of a Digital ID — what opens when the QR
 * code on the back of the card is scanned (see buildVerifyUrl).
 *
 * Deliberately has none of DigitalIdPage's editing machinery: no
 * form, no drawer, no update callbacks, nothing wired to change a
 * field. The card itself still tilts and flips — that's just how
 * it's viewed, not a way to edit it — but there is nothing here a
 * visitor could use to alter the record.
 */
export default function DigitalIdViewPage() {
  const [digitalId, setDigitalId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchDigitalId()
      .then((data) => {
        if (!cancelled) setDigitalId(data);
      })
      .catch(() => {
        if (!cancelled) setError('This Digital ID could not be found.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-svh flex-col items-center bg-cream px-6 py-14">
      <div className="w-full max-w-md text-center">
        <p className="flex items-center justify-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          <ShieldCheckIcon />
          Verified Digital ID
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
          {digitalId ? digitalId.name : 'Verifying credential'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          This is a read-only view — tilt or flip the card to check the details, but nothing
          here can be edited.
        </p>
      </div>

      <div className="mt-10 flex w-full max-w-md flex-col items-center">
        {error && <p className="text-center text-sm text-maroon-light">{error}</p>}
        {!error && !digitalId && (
          <div
            className="w-full max-w-[300px] animate-pulse rounded-2xl bg-line/60"
            style={{ aspectRatio: '1 / 1.586' }}
            aria-label="Loading Digital ID"
            role="status"
          />
        )}
        {digitalId && (
          <div className="w-full max-w-[300px]">
            <DigitalIdCard digitalId={digitalId} />
          </div>
        )}
      </div>
    </main>
  );
}
