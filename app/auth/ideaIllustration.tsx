export function IdeaIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 170" className={className} aria-hidden="true">
      <circle cx="120" cy="88" r="66" fill="var(--blob)" opacity="0.45" />
      <rect x="26" y="38" width="58" height="36" rx="8" fill="var(--card)" />
      <rect x="34" y="48" width="34" height="5" rx="2.5" fill="var(--accent)" />
      <rect x="34" y="59" width="42" height="4" rx="2" fill="var(--line)" />
      <rect x="158" y="100" width="58" height="36" rx="8" fill="var(--card)" />
      <rect x="166" y="110" width="28" height="5" rx="2.5" fill="var(--on-soft)" />
      <rect x="166" y="121" width="42" height="4" rx="2" fill="var(--line)" />
      <path
        d="M120 42a32 32 0 0 0-19 57.7c3.4 2.6 5 6 5 10.3h28c0-4.3 1.6-7.7 5-10.3A32 32 0 0 0 120 42z"
        fill="var(--card)"
        stroke="var(--ink)"
        strokeWidth="3"
      />
      <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M108 122h24M112 132h16" stroke="var(--ink)" />
        <path d="M112 88l8 8 8-8M120 96v14" stroke="var(--accent)" />
        <path d="M176 36l4 8M196 54l-8 3M186 22v8" stroke="var(--accent)" />
      </g>
    </svg>
  );
}
