import { formatIdeaDate, type Idea } from "@/lib/ideas/ideas";

export function IdeaDetail({ idea }: { idea: Idea }) {
  const sections = [
    { heading: "Problem", body: idea.problem },
    { heading: "Solution", body: idea.solution },
    { heading: "Team members", body: idea.team_members },
  ];

  return (
    <article className="mt-6 rounded-2xl border border-line bg-card p-6 sm:p-10">
      <time dateTime={idea.created_at} className="text-xs text-ink-soft">
        Published {formatIdeaDate(idea.created_at)}
      </time>
      <h1 className="mt-2 font-heading text-2xl font-semibold leading-tight break-words sm:text-3xl">
        {idea.title}
      </h1>
      <p className="mt-3 text-lg text-ink-soft break-words">{idea.pitch}</p>
      {sections.map((section) => (
        <section key={section.heading} className="mt-8 border-t border-line pt-6">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-accent">
            {section.heading}
          </h2>
          <p className="mt-2 whitespace-pre-line break-words leading-relaxed">{section.body}</p>
        </section>
      ))}
    </article>
  );
}

export function IdeaDetailSkeleton() {
  return <div aria-hidden="true" className="mt-6 h-96 animate-pulse rounded-2xl border border-line bg-card" />;
}
