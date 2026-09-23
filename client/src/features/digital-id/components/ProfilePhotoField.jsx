import { useId, useRef, useState } from 'react';
import { UploadIcon, TrashIcon, ResetIcon } from '../../../shared/components/icons';
import { DEFAULT_PROFILE_PHOTO } from '../services/digitalIdService';
import { getInitials } from '../utils/digitalIdUtils';
import { ACCEPTED_IMAGE_TYPES, processProfilePhoto } from '../utils/imageUtils';

/**
 * Profile photo control for the Digital ID form.
 *
 * Like every other field here it only edits data — it hands a data URL
 * (or `null`) back through `onChange` and lets the card decide how to
 * render it. The preview mirrors the card's own fallback so what you
 * see in the form is what ends up on the front face.
 */
export default function ProfilePhotoField({ photo, name, onChange }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isDefault = photo === DEFAULT_PROFILE_PHOTO;

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    // Reset the input straight away so picking the *same* file twice
    // still fires a change event.
    event.target.value = '';
    if (!file) return;

    setError(null);
    setBusy(true);
    try {
      onChange(await processProfilePhoto(file));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
    }
  }

  function set(value) {
    setError(null);
    onChange(value);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-ink">Profile photo</legend>

      <div className="flex flex-wrap items-center gap-4">
        {photo ? (
          <img
            src={photo}
            alt="Current profile photo"
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-gold/60"
          />
        ) : (
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink to-maroon-light font-serif text-xl font-semibold text-paper ring-2 ring-gold/60"
            aria-label="No photo — showing initials"
            role="img"
          >
            {getInitials(name)}
          </div>
        )}

        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm font-medium text-ink transition hover:border-gold/60 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold"
            >
              <UploadIcon />
              {busy ? 'Processing…' : photo ? 'Replace photo' : 'Upload photo'}
            </label>
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={handleFileChange}
              disabled={busy}
              className="sr-only"
            />

            {!isDefault && (
              <button
                type="button"
                onClick={() => set(DEFAULT_PROFILE_PHOTO)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-ink-soft transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <ResetIcon />
                Use default
              </button>
            )}

            {photo && (
              <button
                type="button"
                onClick={() => set(null)}
                aria-label="Remove profile photo"
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-ink-soft transition hover:text-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <TrashIcon />
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-ink-soft">
            {isDefault
              ? 'Using the default photo. JPG, PNG or WebP, up to 8 MB.'
              : photo
                ? 'Cropped to a square and resized for the card.'
                : 'No photo — the card falls back to initials.'}
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-maroon-light">
          {error}
        </p>
      )}
    </fieldset>
  );
}
