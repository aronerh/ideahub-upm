
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getIdea } from "@/lib/ideas/queries";
import { EditIdeaForm } from "@/app/ideas/editIdeaForm";

export default async function EditIdeaPage({
  params,
}: PageProps<"/ideas/[id]/edit">) {
  const { id } = await params;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const idea = await getIdea(id);

  if (!idea) {
    notFound();
  }

  if (idea.author_id !== user.id) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <h1 className="font-heading text-3xl font-semibold">
        Edit your idea
      </h1>

      <p className="mt-3 text-ink-soft">
        Update the information about your idea and save your changes.
      </p>

      <EditIdeaForm idea={idea} />
    </main>
  );
}
