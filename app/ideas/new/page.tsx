import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { IdeaForm } from "@/app/ideas/ideaForm";
import { BackLink } from "@/app/ui/backLink";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { emailDomainError, isUpmEmail } from "@/lib/auth/emailDomain";

export const metadata: Metadata = { title: "Publish an idea · IdeaHub UPM" };

// IH-23: the 5-field form. Only signed-in students can open it; visitors go to sign in.
export default function NewIdeaPage() {
  return (
    <main className="mx-auto w-full max-w-[43.25rem] flex-1 px-4 py-8 sm:py-12">
      <BackLink />
      <h1 className="mt-6 font-heading text-4xl font-semibold tracking-[-0.035em] sm:text-[2.625rem]">Publish an idea</h1>
      <p className="mt-2 text-ink-soft">Five short fields. Investors and students can read it right away.</p>
      <div className="mt-6 rounded-xl border border-line bg-card p-6 pt-2 shadow-lift sm:px-8 sm:pb-8">
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
      <p role="alert" className="mt-6 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
        {emailDomainError}
      </p>
    );
  }

  return <IdeaForm />;
}
