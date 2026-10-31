import Link from "next/link";
import { ArrowIcon } from "@/app/ui/arrowIcon";
import { formatIdeaDate, type IdeaSummary } from "@/lib/ideas/ideas";

// Renders ideas in the order given; listIdeas() already sorts them newest first.
export function IdeaList({ ideas }: { ideas: IdeaSummary[] }) {
  if (ideas.length === 0) {
    return (
      <div role="status" className="rounded-xl border border-dashed border-line bg-card px-6 py-16 text-center">
        <p className="font-heading text-xl font-semibold tracking-tight">No ideas yet</p>
        <p className="mt-1 text-sm text-ink-soft">Nobody has published an idea so far. Be the first.</p>
        <Link
          href="/ideas/new"
          className="mt-5 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-glow hover:opacity-90"
        >
          Publish an idea
        </Link>
      </div>
    );
  }

  return (
    <ul aria-label="Published ideas" className="grid gap-3.5 sm:grid-cols-2">
      {ideas.map((idea) => (
        <li key={idea.id}>
          <Link
            href={`/ideas/${idea.id}`}
            className="group flex h-full gap-4 rounded-xl border border-line bg-card p-5 shadow-rest transition-[translate,box-shadow,border-color] duration-[180ms] ease-[cubic-bezier(.16,1,.3,1)] active:border-accent active:translate-y-0 hover:-translate-y-0.5 hover:border-accent hover:shadow-lift focus-visible:-translate-y-0.5 focus-visible:border-accent focus-visible:shadow-lift focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-soft text-lg font-semibold text-on-soft"
            >
              {idea.title.charAt(0).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="font-heading text-xl font-semibold leading-snug tracking-tight break-words">
                {idea.title}
              </h2>
              <p className="mt-1 flex-1 text-ink-soft break-words">{idea.pitch}</p>
              <div className="mt-4 flex items-center justify-between">
                <time dateTime={idea.created_at} className="text-[0.8125rem] tabular-nums text-ink-soft">
                  {formatIdeaDate(idea.created_at)}
                </time>
                <ArrowIcon className="h-4.5 w-4.5 text-accent opacity-0 transition-[opacity,translate] duration-[180ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-100 motion-reduce:transition-none" />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function IdeaListSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-3.5 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl border border-line bg-card" />
      ))}
    </div>
  );
}
