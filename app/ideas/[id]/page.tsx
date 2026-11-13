import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactRequests } from "@/app/ideas/contactRequests";
import { IdeaDetail, IdeaDetailSkeleton } from "@/app/ideas/ideaDetail";
import { BackLink } from "@/app/ui/backLink";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { listContactRequests } from "@/lib/contact/queries";
import { getIdea } from "@/lib/ideas/queries";
import { ContactForm } from "@/app/ideas/contactForm";

export const metadata: Metadata = { title: "Idea · IdeaHub UPM" };

// IH-11 (and where IH-10 sends the student after submitting): one idea with all 5 fields.
export default function IdeaPage({ params, searchParams }: PageProps<"/ideas/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <BackLink />
      <Suspense fallback={<IdeaDetailSkeleton />}>
        <LoadedIdea params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoadedIdea({ params, searchParams }: Pick<PageProps<"/ideas/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const { published } = await searchParams;
  
const idea = await getIdea(id);
if (!idea) notFound();

  // IH-43: only the author sees the requests. RLS would also show an investor their own request.
  const user = await getCurrentUser();
  const contactRequests = user?.id === idea.author_id ? await listContactRequests(idea.id) : null;
  const isOwner = user?.id === idea.author_id;
  const ContactFormComponent = ContactForm;

  return (
    <>
      {published && (
        <p role="status" className="mt-6 rounded-lg bg-soft px-4 py-3 text-sm font-medium text-on-soft">
          Your idea is live. Anyone can read it now.
        </p>
      )}
      <IdeaDetail idea={idea} isOwner={isOwner} />
      {contactRequests && <ContactRequests requests={contactRequests} />}
      {!isOwner && <ContactFormComponent ideaId={idea.id} signedIn={!!user} />}

    </>
  );
}
