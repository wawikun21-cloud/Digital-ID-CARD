/**
 * A labeled text input with consistent styling. Purely presentational —
 * value/onChange are owned by whichever form uses it. `disabled` grays
 * the input out (used for fields only an admin may edit); `hint` shows
 * a small note under the input, e.g. explaining why it's locked.
 */
export default function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  id,
  disabled = false,
  hint,
}) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
          disabled
            ? 'cursor-not-allowed border-line bg-cream text-ink-soft'
            : 'border-line bg-paper text-ink focus:border-gold focus:ring-1 focus:ring-gold'
        }`}
      />
      {hint && <span className="text-[0.7rem] text-ink-soft/80">{hint}</span>}
    </label>
  );
}