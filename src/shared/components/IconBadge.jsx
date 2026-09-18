/**
 * A small circular icon badge, e.g. for a phone/email/site row.
 * Purely presentational — the icon is passed in as an SVG element.
 */
export default function IconBadge({ icon, className = '' }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/90 text-paper ${className}`}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
