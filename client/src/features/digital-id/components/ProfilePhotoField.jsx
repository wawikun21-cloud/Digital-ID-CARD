import { useId, useState } from 'react';
import { UploadIcon } from '../../../shared/components/icons';
import { ACCEPTED_IMAGE_TYPES, processProfilePhoto } from '../utils/imageUtils';

/**
 * Profile photo control for the Digital ID form. The card needs a
 * transparent-background PNG (it is layered under the overlay), so the
 * upload is validated for that and the preview sits on a dark tile
 * that makes transparency obvious.
 *
 * Like every other field here it only edits data: it hands a PNG data
 * URL back through `onChange` and lets the card decide how to render it.
 */
export default function ProfilePhotoField({ photo, onChange }) {
  const inputId = useId();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    // Reset straight away so picking the *same* file twice still fires a change event.
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

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-ink">Profile photo</legend>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-[#220210] ring-2 ring-gold/60">
          {photo ? (
            <img src={photo} alt="Current profile photo" className="h-full w-full object-contain object-bottom" />
          ) : (
            <span className="pb-2 text-[0.65rem] text-white/60">No photo</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-2">
          <div>
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm font-medium text-ink transition hover:border-gold/60 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold"
            >
              <UploadIcon />
              {busy ? 'Processing…' : photo ? 'Replace photo' : 'Upload photo'}
            </label>
            <input
              id={inputId}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={handleFileChange}
              disabled={busy}
              className="sr-only"
            />
          </div>

          <p className="text-xs text-ink-soft">
            PNG with a transparent background, up to 8 MB. Half-length portraits work best; the
            bottom edge is tucked behind the card&apos;s curve.
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
