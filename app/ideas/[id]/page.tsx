import type { Metadata } from "next";
import { Suspense } from "react";
import { IdeaDetailSkeleton } from "@/app/ideas/ideaDetail";
import { LoadedIdea } from "@/app/ideas/[id]/loadedIdea";
import { BackLink } from "@/app/ui/backLink";

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
