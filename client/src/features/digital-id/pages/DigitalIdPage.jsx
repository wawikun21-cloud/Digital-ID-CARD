import { useCallback, useEffect, useState } from 'react';
import DigitalIdCard from '../components/DigitalIdCard';
import DigitalIdForm from '../components/DigitalIdForm';
import DigitalIdSaveBar from '../components/DigitalIdSaveBar';
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
    dirty,
    saving,
    saveStatus,
    save,
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
      <div className="flex w-full max-w-md flex-col items-center">
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
              description="The card previews your changes. Press Save to keep them."
              footer={<DigitalIdSaveBar onSave={save} saving={saving} dirty={dirty} saveStatus={saveStatus} />}
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