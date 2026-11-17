
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getIdea } from "@/lib/ideas/queries";
import { EditIdeaForm } from "@/app/ideas/editIdeaForm";

// IH-46: Edit page with a Suspense boundary.
export default function EditIdeaPage({
  params,
}: PageProps<"/ideas/[id]/edit">) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <h1 className="font-heading text-3xl font-semibold">
        Edit your idea
      </h1>

      <p className="mt-3 text-ink-soft">
        Update the information about your idea and save your changes.
      </p>

      <Suspense
        fallback={
          <p role="status" className="mt-6 text-ink-soft">
            Loading your idea...
          </p>
        }
      >
        <LoadedEditIdea params={params} />
      </Suspense>
    </main>
  );
}

// Runtime data is loaded inside the Suspense boundary.
async function LoadedEditIdea({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check authentication.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Load the idea.
  const idea = await getIdea(id);

  if (!idea) {
    notFound();
  }

  // Allow only the idea owner to edit it.
  if (idea.author_id !== user.id) {
    notFound();
  }

  return <EditIdeaForm idea={idea} />;
}
