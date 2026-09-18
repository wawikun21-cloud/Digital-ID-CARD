import { useEffect, useState } from 'react';
import DigitalIdCard from '../components/DigitalIdCard';
import DigitalIdForm from '../components/DigitalIdForm';
import { useDigitalIdForm } from '../hooks/useDigitalIdForm';
import { fetchDigitalId } from '../services/digitalIdService';

export default function DigitalIdPage() {
  const [error, setError] = useState(null);
  const {
    digitalId,
    loadDigitalId,
    updateField,
    updateContactField,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
  } = useDigitalIdForm();

  useEffect(() => {
    let cancelled = false;

    fetchDigitalId()
      .then((data) => {
        if (!cancelled) loadDigitalId(data);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load this Digital ID right now.');
      });

    return () => {
      cancelled = true;
    };
  }, [loadDigitalId]);

  return (
    <main className="flex min-h-svh flex-col items-center bg-cream px-6 py-14">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Digital ID
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
          Your credential, always on hand
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Tilt it, flip it, scan it. Edit any field below and the card updates live — add a
          social link on the back and its icon is detected automatically.
        </p>
      </div>

      <div className="mt-10 w-full max-w-4xl">
        {error && <p className="text-center text-sm text-maroon-light">{error}</p>}
        {!error && !digitalId && (
          <div
            className="mx-auto w-full max-w-[300px] animate-pulse rounded-2xl bg-line/60"
            style={{ aspectRatio: '1 / 1.586' }}
            aria-label="Loading Digital ID"
            role="status"
          />
        )}
        {digitalId && (
          <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:items-start">
            <div className="lg:sticky lg:top-14">
              <DigitalIdCard digitalId={digitalId} />
            </div>
            <DigitalIdForm
              digitalId={digitalId}
              onUpdateField={updateField}
              onUpdateContactField={updateContactField}
              onAddSocialLink={addSocialLink}
              onUpdateSocialLink={updateSocialLink}
              onRemoveSocialLink={removeSocialLink}
            />
          </div>
        )}
      </div>
    </main>
  );
}
