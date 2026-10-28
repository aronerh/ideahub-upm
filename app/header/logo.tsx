export function Logo() {
  return (
    <span className="flex items-center gap-2 font-heading text-base font-bold">
      <span className="flex h-7 w-7 -rotate-6 items-center justify-center rounded-lg bg-accent text-on-accent">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
        </svg>
      </span>
      IdeaHub
      <span className="rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-on-soft">
        UPM
      </span>
    </span>
  );
}
