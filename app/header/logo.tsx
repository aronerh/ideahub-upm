// A hub of connected ideas, with one green node: the new idea joining it.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M16 16V5M16 16v11M16 16l9.5 5.5M16 16l-9.5 5.5M16 16 6.5 10.5" />
        <path d="m16 16 9.5-5.5" stroke="var(--accent)" />
      </g>
      <g fill="currentColor">
        <circle cx="16" cy="16" r="3.6" />
        <circle cx="16" cy="5" r="2.3" />
        <circle cx="16" cy="27" r="2.3" />
        <circle cx="25.5" cy="21.5" r="2.3" />
        <circle cx="6.5" cy="21.5" r="2.3" />
        <circle cx="6.5" cy="10.5" r="2.3" />
      </g>
      <circle cx="25.5" cy="10.5" r="3.4" fill="var(--accent)" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
      <LogoMark className="h-7 w-7" />
      IdeaHub
      <span className="font-medium text-ink-soft">UPM</span>
    </span>
  );
}
