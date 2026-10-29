import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IdeaDetail, IdeaDetailSkeleton } from "@/app/ideas/ideaDetail";
import { getIdea } from "@/lib/ideas/queries";

export const metadata: Metadata = { title: "Idea · IdeaHub UPM" };

// IH-11 (and where IH-10 sends the student after submitting): one idea with all 5 fields.
export default function IdeaPage({ params }: PageProps<"/ideas/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        ← All ideas
      </Link>
      <Suspense fallback={<IdeaDetailSkeleton />}>
        <LoadedIdea params={params} />
      </Suspense>
    </main>
  );
}

async function LoadedIdea({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = await getIdea(id);
  if (!idea) notFound();

  return <IdeaDetail idea={idea} />;
}
