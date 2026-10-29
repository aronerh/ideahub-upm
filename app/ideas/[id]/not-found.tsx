import Link from "next/link";

// Replaces the whole page (not just the Suspense part), so it brings its own <main> wrapper.
export default function IdeaNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        ← All ideas
      </Link>
      <div role="status" className="mt-6 rounded-2xl border border-line bg-card px-6 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Idea not found</h1>
        <p className="mt-1 text-sm text-ink-soft">The link may be wrong, or the idea isn’t there any more.</p>
      </div>
    </main>
  );
}
