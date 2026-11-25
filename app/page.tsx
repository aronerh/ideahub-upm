import { Suspense } from "react";
import { IdeaList, IdeaListSkeleton } from "@/app/ideas/ideaList";
import { IdeaSearch } from "@/app/ideas/ideaSearch";
import { isFiltering, readIdeaSearch } from "@/lib/ideas/classification";
import { listIdeas } from "@/lib/ideas/queries";

// IH-11: visitors browse published ideas without signing in.
// IH-14: search and filter them by sector and stage.
export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-[76rem] flex-1 px-4 py-8 sm:py-12">
      <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Explore ideas</h1>
      <p className="mt-3 text-ink-soft sm:text-lg">What UPM students are working on, newest first.</p>
      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-semibold text-ink">Anyone can read.</span> Publishing needs a UPM email.
      </p>
      <div className="mt-8">
        <Suspense fallback={<IdeaListSkeleton />}>
          <PublishedIdeas searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function PublishedIdeas({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const search = readIdeaSearch(await searchParams);
  const ideas = await listIdeas(search);
  const filtering = isFiltering(search);

  return (
    <>
      <IdeaSearch search={search} />
      {filtering && ideas.length > 0 && (
        <p role="status" className="mt-4 text-sm text-ink-soft">
          {ideas.length === 1 ? "1 idea matches" : `${ideas.length} ideas match`}
        </p>
      )}
      <div className="mt-5">
        <IdeaList ideas={ideas} filtering={filtering} />
      </div>
    </>
  );
}
