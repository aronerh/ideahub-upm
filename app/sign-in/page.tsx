import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { AuthForm } from "@/app/auth/authForm";
import { AuthShell } from "@/app/auth/authShell";

export const metadata: Metadata = { title: "Sign in · IdeaHub UPM" };

export default function SignInPage() {
  return (
    <AuthShell tagline="Welcome back" subline="Pick up where you left off.">
      <AuthForm
        action={signIn}
        title="Sign in"
        submitLabel="Sign in"
        passwordAutoComplete="current-password"
        footer={
          <>
            New here?{" "}
            <Link href="/sign-up" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </>
        }
      />
    </AuthShell>
  );
}
