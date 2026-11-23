import Link from "next/link";
import { formatIdeaDate, type Idea } from "@/lib/ideas/ideas";
import { DeleteIdeaButton } from "@/app/ideas/deleteIdeaButton";
import { UpmBadge } from "@/app/ui/upmBadge";

export function IdeaDetail({
  idea,
  isOwner = false,
}: {
  idea: Idea;
  isOwner?: boolean;
}) {
  const sections = [
    { heading: "Problem", body: idea.problem },
    { heading: "Solution", body: idea.solution },
    { heading: "Team members", body: idea.team_members },
  ];

  return (
    <article className="mt-6 rounded-xl border border-line bg-card p-6 shadow-lift sm:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <time dateTime={idea.created_at} className="text-xs text-ink-soft">
          Published {formatIdeaDate(idea.created_at)}
        </time>
        <UpmBadge />
      </div>

      <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight break-words sm:text-4xl">
        {idea.title}
      </h1>

      <p className="mt-3 text-lg text-ink-soft break-words">
        {idea.pitch}
      </p>

      {sections.map((section) => (
        <section
          key={section.heading}
          className="mt-8 border-t border-line pt-6"
        >
          <h2 className="font-heading text-sm font-semibold text-accent">
            {section.heading}
          </h2>

          {section.body === null ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-sm text-ink-soft">
                Only UPM students and investors can read this.
              </p>
              <Link
                href="/sign-in"
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:border-accent hover:text-accent"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <p className="mt-2 max-w-prose whitespace-pre-line break-words leading-relaxed">
              {section.body}
            </p>
          )}
        </section>
      ))}

      
      {isOwner && (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Link
            href={`/ideas/${idea.id}/edit`}
            className="inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-soft"
          >
            Edit idea
          </Link>

          <DeleteIdeaButton ideaId={idea.id} />
        </div>
      )}
    </article>
  );
}

export function IdeaDetailSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mt-6 h-96 animate-pulse rounded-xl border border-line bg-card"
    />
  );
}
