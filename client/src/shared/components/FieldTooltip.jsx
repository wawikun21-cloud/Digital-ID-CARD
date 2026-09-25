/**
 * Small callout anchored under a specific field, used to show that
 * field's validation message (client-side or mapped from the server).
 * Render inside a `relative`-positioned wrapper around the input.
 */
export default function FieldTooltip({ message }) {
  if (!message) {
    return null;
  }
  return (
    <div role="alert" className="relative z-10 mt-1.5">
      <span className="absolute -top-[5px] left-3 h-2.5 w-2.5 rotate-45 border-l border-t border-maroon-light/40 bg-paper" />
      <p className="relative rounded-md border border-maroon-light/40 bg-paper px-2.5 py-1.5 text-xs font-medium leading-snug text-maroon-light shadow-sm">
        {message}
      </p>
    </div>
  );
}