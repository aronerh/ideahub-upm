import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/app/auth/authShell";

export const metadata: Metadata = { title: "Link expired · IdeaHub UPM" };

export default function AuthErrorPage() {
  return (
    <AuthShell tagline="Where UPM ideas meet investors" subline="Publish your idea in under 5 minutes.">
      <h1 className="font-heading text-2xl font-semibold">That link didn’t work</h1>
      <p className="mt-2 text-sm text-ink-soft">
        It may have expired or already been used. If you already confirmed your
        email, sign in. Otherwise, create your account again.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/sign-in"
          className="rounded-lg bg-accent px-4 py-2.5 font-heading text-sm font-semibold text-on-accent hover:opacity-90"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium hover:bg-soft"
        >
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
