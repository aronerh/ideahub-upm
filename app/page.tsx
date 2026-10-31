import { Suspense } from "react";
import { IdeaList, IdeaListSkeleton } from "@/app/ideas/ideaList";
import { listIdeas } from "@/lib/ideas/queries";

// IH-11: visitors browse published ideas without signing in.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[76rem] flex-1 px-4 py-8 sm:py-12">
      <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Explore ideas</h1>
      <p className="mt-3 text-ink-soft sm:text-lg">What UPM students are working on, newest first.</p>
      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-semibold text-ink">Anyone can read.</span> Publishing needs a UPM email.
      </p>
      <div className="mt-8">
        <Suspense fallback={<IdeaListSkeleton />}>
          <PublishedIdeas />
        </Suspense>
      </div>
    </main>
  );
}

async function PublishedIdeas() {
  const ideas = await listIdeas();
  return <IdeaList ideas={ideas} />;
}
