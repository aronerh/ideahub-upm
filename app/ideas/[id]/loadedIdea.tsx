import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactRequests } from "@/app/ideas/contactRequests";
import { MarkRequestsRead } from "@/app/ideas/markRequestsRead";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { listContactRequests, listMessages, listMyContactRequests } from "@/lib/contact/queries";
import { getIdea } from "@/lib/ideas/queries";
import { ContactForm } from "@/app/ideas/contactForm";
import { YourRequests } from "@/app/ideas/yourRequests";
import { IdeaDetail } from "@/app/ideas/ideaDetail";

export async function LoadedIdea({ params, searchParams }: Pick<PageProps<"/ideas/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const { published, view } = await searchParams;

const idea = await getIdea(id);
if (!idea) notFound();

  // IH-43: only the author sees the requests. RLS would also show an investor their own request.
  const user = await getCurrentUser();
  const isOwner = user?.id === idea.author_id;

  // IH-91: preview anonymous visibility without changing authentication.
  const visitorPreview = isOwner && view === "visitor";
  const displayedIdea = visitorPreview
    ? {
        ...idea,
        problem: idea.problem_private ? null : idea.problem,
        solution: idea.solution_private ? null : idea.solution,
        // IH-94: a public team is shown to visitors too.
        team_members: idea.team_private ? null : idea.team_members,
      }
    : idea;

  const contactRequests = isOwner && !visitorPreview ? await listContactRequests(idea.id) : null;
  // IH-105: an investor sees their own requests about this idea, and both sides see the replies.
  const myRequests = user && !isOwner ? await listMyContactRequests(idea.id, user.id) : [];
  const messages = await listMessages([...(contactRequests ?? []), ...myRequests].map((request) => request.id));
  const ContactFormComponent = ContactForm;

  return (
    <>
      {published && !visitorPreview && (
        <p role="status" className="mt-6 rounded-lg bg-soft px-4 py-3 text-sm font-medium text-on-soft">
          Your idea is live. Anyone can read it now.
        </p>
      )}
      {isOwner && (
        <div className="mt-6">
          {visitorPreview ? (
            <div role="status" className="rounded-lg border border-line bg-soft p-4">
              <p className="text-sm font-semibold text-ink">Visitor preview</p>
              <p className="mt-1 text-sm text-ink-soft">
                This is how your idea appears to signed-out visitors.
              </p>
              <Link
                href={`/ideas/${idea.id}`}
                className="mt-3 inline-flex rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
              >
                Back to my view
              </Link>
            </div>
          ) : (
            <Link
              href={`/ideas/${idea.id}?view=visitor`}
              className="inline-flex rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
            >
              See as visitor
            </Link>
          )}
        </div>
      )}
      <IdeaDetail idea={displayedIdea} isOwner={isOwner && !visitorPreview} />
      {contactRequests && user && <ContactRequests requests={contactRequests} messages={messages} userId={user.id} />}
      {contactRequests?.some((request) => request.read_at === null) && <MarkRequestsRead ideaId={idea.id} />}
      {user && <YourRequests requests={myRequests} messages={messages} userId={user.id} />}
      {(!isOwner || visitorPreview) && <ContactFormComponent ideaId={idea.id} signedIn={!!user && !visitorPreview} />}

    </>
  );
}
