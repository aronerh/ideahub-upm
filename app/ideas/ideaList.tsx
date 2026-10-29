import Link from "next/link";
import { formatIdeaDate, type IdeaSummary } from "@/lib/ideas/ideas";

// Renders ideas in the order given; listIdeas() already sorts them newest first.
export function IdeaList({ ideas }: { ideas: IdeaSummary[] }) {
  if (ideas.length === 0) {
    return (
      <div role="status" className="rounded-2xl border border-dashed border-line bg-card px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold">No ideas yet</p>
        <p className="mt-1 text-sm text-ink-soft">
          Nobody has published an idea so far. Be the first: use “Publish an idea” at the top.
        </p>
      </div>
    );
  }

  return (
    <ul aria-label="Published ideas" className="grid gap-4 sm:grid-cols-2">
      {ideas.map((idea) => (
        <li key={idea.id}>
          <Link
            href={`/ideas/${idea.id}`}
            className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
          >
            <h2 className="font-heading text-lg font-semibold leading-snug break-words">{idea.title}</h2>
            <p className="mt-2 flex-1 text-sm text-ink-soft break-words">{idea.pitch}</p>
            <time dateTime={idea.created_at} className="mt-4 text-xs text-ink-soft">
              {formatIdeaDate(idea.created_at)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function IdeaListSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl border border-line bg-card" />
      ))}
    </div>
  );
}
