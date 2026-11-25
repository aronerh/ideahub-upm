// The small down chevron on menus (sector and stage), in place of the browser's own arrows.
// Sits inside a `relative` wrapper, on the right of the select.
export function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 opacity-60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}
