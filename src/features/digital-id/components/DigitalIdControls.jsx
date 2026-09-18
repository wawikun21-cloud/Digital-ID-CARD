import { FlipIcon, ResetIcon } from '../../../shared/components/icons';

/**
 * Secondary controls for people who won't think to click the card
 * itself. Deliberately quiet — real buttons, small, out of the way.
 */
export default function DigitalIdControls({ onFlip, onReset, flipped }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onFlip}
        className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-gold/60 hover:text-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <FlipIcon />
        {flipped ? 'Show front' : 'Show back'}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink-soft shadow-sm transition hover:border-gold/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <ResetIcon />
        Reset view
      </button>
    </div>
  );
}
