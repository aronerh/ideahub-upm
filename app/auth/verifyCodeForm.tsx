"use client";

import { useActionState } from "react";
import { resendCode, verifyCode } from "@/app/auth/actions";
import { FormField } from "@/app/ui/formField";
import { codeLength } from "@/lib/auth/verificationCode";

// IH-33: shown after sign-up. The student types the code from the email instead of clicking a link,
// because email scanners open links and use them up (IH-32) but can't type.
export function VerifyCodeForm({ email }: { email: string }) {
  const [verifyState, verifyAction, verifying] = useActionState(verifyCode, {});
  const [resendState, resendAction, resending] = useActionState(resendCode, {});

  return (
    <div className="flex flex-col">
      <div className="flex h-14 w-14 items-center justify-center self-center rounded-full bg-soft">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>
      <h1 className="mt-4 text-center font-heading text-xl font-semibold">Check your email</h1>
      <p className="mt-2 text-center text-sm text-ink-soft">
        We sent a {codeLength}-digit code to{" "}
        <span className="font-medium text-ink">{email}</span>. Enter it to finish creating your
        account.
      </p>

      <form action={verifyAction} noValidate className="flex flex-col">
        <input type="hidden" name="email" value={email} />
        <FormField
          name="code"
          label="Code"
          autoComplete="one-time-code"
          inputMode="numeric"
          placeholder={"0".repeat(codeLength)}
          maxLength={codeLength}
          error={verifyState.error}
        />
        <button
          type="submit"
          disabled={verifying}
          className="mt-6 rounded-lg bg-accent py-2.5 font-heading text-[0.9375rem] font-semibold text-on-accent transition-[opacity,scale] hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        >
          {verifying ? "Checking…" : "Verify"}
        </button>
      </form>

      <form action={resendAction} className="mt-4 flex flex-col items-center gap-2 text-sm">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={resending}
          className="font-medium text-accent hover:underline disabled:opacity-60"
        >
          {resending ? "Sending…" : "Send a new code"}
        </button>
        {resendState.notice && (
          <p role="status" className="text-ink-soft">
            {resendState.notice}
          </p>
        )}
        {resendState.error && (
          <p role="alert" className="text-danger">
            {resendState.error}
          </p>
        )}
      </form>
    </div>
  );
}
