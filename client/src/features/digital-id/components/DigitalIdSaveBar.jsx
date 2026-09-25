/**
 * Save button + result message, shown in the editor drawer's footer.
 * Presentational only: the hook owns `dirty` / `saving` / `saveStatus`.
 */
export default function DigitalIdSaveBar({ onSave, saving = false, dirty = false, saveStatus = null }) {
  return (
    <div className="flex flex-col gap-2">
      {saveStatus && (
        <p
          role={saveStatus.type === 'error' ? 'alert' : 'status'}
          className={`text-xs font-medium ${
            saveStatus.type === 'error' ? 'text-maroon-light' : 'text-ink-soft'
          }`}
        >
          {saveStatus.message}
        </p>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={saving || !dirty}
        className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
      </button>
    </div>
  );
}
