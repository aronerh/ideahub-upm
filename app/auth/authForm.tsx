"use client";

import { useActionState, type ReactNode } from "react";
import type { AuthState } from "@/app/auth/actions";
import { CheckEmail } from "@/app/auth/checkEmail";
import { FormField } from "@/app/ui/formField";

type AuthFormProps = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  title: string;
  subtitle?: string;
  submitLabel: string;
  passwordAutoComplete: "new-password" | "current-password";
  footer: ReactNode;
};

export function AuthForm({
  action,
  title,
  subtitle,
  submitLabel,
  passwordAutoComplete,
  footer,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  if (state.confirmationSentTo) {
    return <CheckEmail email={state.confirmationSentTo} />;
  }

  return (
    <form action={formAction} noValidate className="flex flex-col">
      <h1 className="font-heading text-[2.125rem] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}

      {state.formError && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {state.formError}
        </p>
      )}

      <FormField
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="name@alumnos.upm.es"
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <FormField
        name="password"
        type="password"
        label="Password"
        autoComplete={passwordAutoComplete}
        error={state.fieldErrors?.password}
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg bg-accent py-2.5 font-heading text-[0.9375rem] font-semibold text-on-accent transition-[opacity,scale] hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Sending…" : submitLabel}
      </button>

      <p className="mt-4 text-center text-sm text-ink-soft">{footer}</p>
    </form>
  );
}
