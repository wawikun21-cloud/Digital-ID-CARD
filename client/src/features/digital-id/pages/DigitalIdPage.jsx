import { useCallback, useEffect, useState } from 'react';
import DigitalIdCard from '../components/DigitalIdCard';
import DigitalIdForm from '../components/DigitalIdForm';
import Drawer from '../../../shared/components/Drawer';
import { PencilIcon } from '../../../shared/components/icons';
import { useDigitalIdForm } from '../hooks/useDigitalIdForm';
import { fetchDigitalId } from '../services/digitalIdService';
import { useAuth } from '../../auth/AuthContext';

export default function DigitalIdPage() {
  const [error, setError] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const closeEditor = useCallback(() => setEditorOpen(false), []);
  const { user } = useAuth();

  const {
    digitalId,
    loadDigitalId,
    updateField,
    updateContactField,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    resetToDefault,
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
          Tilt it, flip it, scan it. Open the editor to change any field and the card updates
          live — add a social link on the back and its icon is detected automatically.
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
          <>
            <div className="w-full max-w-[300px]">
              <DigitalIdCard digitalId={digitalId} />
            </div>

            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              aria-expanded={editorOpen}
              className="mt-8 flex items-center gap-2 rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition hover:border-gold/60 hover:text-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <PencilIcon />
              Edit details
            </button>

            <Drawer
              open={editorOpen}
              onClose={closeEditor}
              title="Edit Digital ID"
              description="Changes apply to the card as you type."
            >
              <DigitalIdForm
                digitalId={digitalId}
                onUpdateField={updateField}
                onUpdateContactField={updateContactField}
                onAddSocialLink={addSocialLink}
                onUpdateSocialLink={updateSocialLink}
                onRemoveSocialLink={removeSocialLink}
                onResetToDefault={resetToDefault}
                isAdmin={user?.role === 'admin'}
              />
            </Drawer>
          </>
        )}
      </div>
    </main>
  );
}
