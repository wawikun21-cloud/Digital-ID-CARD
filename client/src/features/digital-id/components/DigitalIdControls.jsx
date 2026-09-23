import { DownloadIcon } from '../../../shared/components/icons';

/**
 * Secondary controls for people who won't think to click the card
 * itself. Deliberately quiet — real buttons, small, out of the way.
 */
export default function DigitalIdControls({ onDownloadQr, downloadError }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onDownloadQr}
        className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft shadow-sm transition hover:border-gold/60 hover:text-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <DownloadIcon />
        Download QR
      </button>
      {downloadError && (
        <p role="alert" className="text-center text-xs font-medium text-maroon-light">
          {downloadError}
        </p>
      )}
    </div>
  );
}
