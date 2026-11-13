"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestContact, type ContactFormState } from "@/app/ideas/contactActions";
import { FormField } from "@/app/ui/formField";
import { contactMessageMaxLength } from "@/lib/contact/contactRequests";

const initialState: ContactFormState = {};
const messageHint = `1 to ${contactMessageMaxLength} characters.`;

// IH-41 (story IH-15): the "Contact the team" form on the idea page.
// Posts to the requestContact server action from IH-42.
export function ContactForm({ ideaId, signedIn }: { ideaId: string; signedIn: boolean }) {
  const [state, formAction, pending] = useActionState(requestContact, initialState);

  if (!signedIn) {
    return (
      <section className="mt-10 rounded-xl border border-line bg-card p-5 sm:p-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Contact the team</h2>
        <p className="mt-2 text-sm text-ink-soft">
          <Link href="/sign-in" className="font-medium text-accent underline underline-offset-2">
            Sign in
          </Link>{" "}
          to send this team a message.
        </p>
      </section>
    );
  }

  if (state.sent) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mt-10 rounded-lg bg-soft px-4 py-3 text-sm font-medium text-on-soft"
      >
        Request sent. The team will get your message.
      </p>
    );
  }

  return (
    <section className="mt-10 rounded-xl border border-line bg-card p-5 sm:p-6">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">Contact the team</h2>
      <p className="mt-1 text-sm text-ink-soft">Introduce yourself and say why this idea interests you.</p>

      <form action={formAction} noValidate className="mt-4 flex flex-col">
        <input type="hidden" name="idea_id" value={ideaId} />

        {state.formError && (
          <p role="alert" className="mt-0 mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {state.formError}
          </p>
        )}

        <FormField
          name="message"
          label="Your message"
          multiline
          required
          defaultValue={state.message}
          maxLength={contactMessageMaxLength}
          error={state.messageError}
        />
        <p className="mt-1 text-xs text-ink-soft">{messageHint}</p>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 self-start rounded-lg bg-accent px-4 py-2.5 font-heading text-[0.9375rem] font-semibold text-on-accent transition-[opacity,scale] hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        >
          {pending ? "Sending…" : "Contact the team"}
        </button>
      </form>
    </section>
  );
}