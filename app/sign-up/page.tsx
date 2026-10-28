import type { Metadata } from "next";
import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { AuthForm } from "@/app/auth/authForm";
import { AuthShell } from "@/app/auth/authShell";

export const metadata: Metadata = { title: "Sign up · IdeaHub UPM" };

export default function SignUpPage() {
  return (
    <AuthShell
      tagline="Where UPM ideas meet investors"
      subline="Publish your idea in under 5 minutes."
    >
      <AuthForm
        action={signUp}
        title="Create your account"
        subtitle="Use your UPM email to publish ideas."
        submitLabel="Create account"
        passwordAutoComplete="new-password"
        footer={
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </>
        }
      />
    </AuthShell>
  );
}
