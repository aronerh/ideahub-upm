import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { IdeaForm } from "@/app/ideas/ideaForm";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { emailDomainError, isUpmEmail } from "@/lib/auth/emailDomain";

export const metadata: Metadata = { title: "Publish an idea · IdeaHub UPM" };

// IH-23: the 5-field form. Only signed-in students can open it; visitors go to sign in.
export default function NewIdeaPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        ← All ideas
      </Link>
      <div className="mt-6 rounded-2xl border border-line bg-card p-6 sm:p-10">
        <h1 className="font-heading text-2xl font-semibold">Publish an idea</h1>
        <p className="mt-1 text-sm text-ink-soft">Five short fields. Investors and students can read it right away.</p>
        <Suspense fallback={<div aria-hidden="true" className="mt-6 h-96 animate-pulse rounded-lg bg-soft" />}>
          <PublishGate />
        </Suspense>
      </div>
    </main>
  );
}

async function PublishGate() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  if (!isUpmEmail(user.email)) {
    return (
      <p role="alert" className="mt-6 rounded-lg bg-soft px-3 py-2 text-sm text-on-soft">
        {emailDomainError}
      </p>
    );
  }

  return <IdeaForm />;
}
