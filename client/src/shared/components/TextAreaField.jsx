/**
 * A labeled textarea, styled to match TextField. Split out rather
 * than overloading TextField with a `multiline` prop, since a
 * textarea needs its own row count, resize behaviour and char count —
 * keeping it separate leaves TextField simple for every other field.
 */
export default function TextAreaField({
  label,
  value = '',
  onChange,
  placeholder,
  id,
  rows = 2,
  maxLength,
}) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1">
      <span className="flex items-baseline justify-between text-xs font-medium text-ink-soft">
        {label}
        {maxLength && (
          <span className="text-[0.7rem] font-normal text-ink-soft/70">
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
      />
    </label>
  );
}
