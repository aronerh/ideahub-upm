import Link from "next/link";

export default function IdeaNotFound() {
  return (
    <div role="status" className="mt-6 rounded-2xl border border-line bg-card px-6 py-16 text-center">
      <h1 className="font-heading text-xl font-semibold">Idea not found</h1>
      <p className="mt-1 text-sm text-ink-soft">The link may be wrong, or the idea isn’t there any more.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
        Browse all ideas
      </Link>
    </div>
  );
}
