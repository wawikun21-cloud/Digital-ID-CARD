/**
 * A labeled text input with consistent styling. Purely presentational —
 * value/onChange are owned by whichever form uses it.
 */
export default function TextField({ label, value, onChange, type = 'text', placeholder, id }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
      />
    </label>
  );
}
