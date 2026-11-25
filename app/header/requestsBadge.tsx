import Link from "next/link";

// IH-97: how many contact requests the student hasn't read yet. It opens the idea with the newest
// one, where the requests are listed (IH-43) and get marked as read.
export function RequestsBadge({ count, ideaId }: { count: number; ideaId: string }) {
  const label = `${count} unread contact ${count === 1 ? "request" : "requests"}`;

  return (
    <Link
      href={`/ideas/${ideaId}`}
      aria-label={label}
      title={label}
      className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-soft hover:text-ink"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute -right-1 -top-1 min-w-[1.125rem] rounded-full bg-accent px-1 text-center text-[0.6875rem] font-semibold leading-[1.125rem] tabular-nums text-on-accent"
      >
        {count > 9 ? "9+" : count}
      </span>
    </Link>
  );
}
