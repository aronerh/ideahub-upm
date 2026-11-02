"use client";

import { useActionState } from "react";
import { type IdeaFormState, publishIdea } from "@/app/ideas/actions";
import { ArrowIcon } from "@/app/ui/arrowIcon";
import { FormField } from "@/app/ui/formField";
import { ideaFieldMaxLength as maxLength } from "@/lib/ideas/ideas";

export function IdeaForm() {
  const [state, formAction, pending] = useActionState<IdeaFormState, FormData>(publishIdea, {});
  const values = state.values;

  return (
    <form action={formAction} className="flex flex-col">
      {state.formError && (
        <p role="alert" className="mt-6 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.formError}
        </p>
      )}

      <FormField
        name="title"
        label="Title"
        placeholder="Study room finder"
        required
        maxLength={maxLength.title}
        defaultValue={values?.title}
      />
      <FormField
        name="pitch"
        label="One-line pitch"
        placeholder="See which UPM study rooms are free right now."
        required
        maxLength={maxLength.pitch}
        defaultValue={values?.pitch}
      />
      <FormField
        name="problem"
        label="Problem"
        placeholder="What problem does it solve, and for whom?"
        multiline
        required
        maxLength={maxLength.problem}
        defaultValue={values?.problem}
      />
      <FormField
        name="solution"
        label="Solution"
        placeholder="How does your idea solve it?"
        multiline
        required
        maxLength={maxLength.solution}
        defaultValue={values?.solution}
      />
      <FormField
        name="team_members"
        label="Team members"
        placeholder="Names of everyone working on it"
        multiline
        required
        maxLength={maxLength.team_members}
        defaultValue={values?.team_members}
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 font-heading text-[0.9375rem] font-semibold text-on-accent transition-[opacity,scale] hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish idea"}
        {!pending && <ArrowIcon className="h-4 w-4" />}
      </button>
    </form>
  );
}
