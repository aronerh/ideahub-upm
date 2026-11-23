
"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  type IdeaFormState,
  updateIdea,
} from "@/app/ideas/actions";

import { ClassificationFields } from "@/app/ideas/classificationFields";
import { ArrowIcon } from "@/app/ui/arrowIcon";
import { FormField } from "@/app/ui/formField";

import {
  type Idea,
  type IdeaInput,
  ideaFieldMaxLength as maxLength,
} from "@/lib/ideas/ideas";
import { type IdeaClassification, isSector, isStage } from "@/lib/ideas/classification";

export function EditIdeaForm({ idea }: { idea: Idea }) {
  // Existing values used to pre-fill the form. Only the author opens this page,
  // so idea_details (IH-38) always sends every field; the fallbacks only satisfy the types.
  const initialValues: IdeaInput = {
    title: idea.title,
    pitch: idea.pitch,
    problem: idea.problem ?? "",
    solution: idea.solution ?? "",
    team_members: idea.team_members ?? "",
  };

  // IH-14: ideas published before sectors and stages existed start with nothing picked.
  const initialClassification: IdeaClassification = {
    sector: isSector(idea.sector) ? idea.sector : "",
    stage: isStage(idea.stage) ? idea.stage : "",
  };

  // Bind the idea ID to our IH-46 server action.
  const updateAction = updateIdea.bind(null, idea.id);

  const [state, formAction, pending] = useActionState<
    IdeaFormState,
    FormData
  >(updateAction, { values: initialValues, classification: initialClassification });

  // Keep the student's edited values after validation errors.
  const values = state.values ?? initialValues;
  const classification = state.classification ?? initialClassification;
  const errors = state.fieldErrors;

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col"
    >
      {state.formError && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {state.formError}
        </p>
      )}

      <FormField
        name="title"
        label="Title"
        placeholder="Study room finder"
        required
        maxLength={maxLength.title}
        defaultValue={values.title}
        error={errors?.title}
      />

      <FormField
        name="pitch"
        label="One-line pitch"
        placeholder="See which UPM study rooms are free right now."
        required
        maxLength={maxLength.pitch}
        defaultValue={values.pitch}
        error={errors?.pitch}
      />

      <ClassificationFields values={classification} errors={errors} />

      <FormField
        name="problem"
        label="Problem"
        placeholder="What problem does it solve, and for whom?"
        multiline
        required
        maxLength={maxLength.problem}
        defaultValue={values.problem}
        error={errors?.problem}
      />

      <FormField
        name="solution"
        label="Solution"
        placeholder="How does your idea solve it?"
        multiline
        required
        maxLength={maxLength.solution}
        defaultValue={values.solution}
        error={errors?.solution}
      />

      <FormField
        name="team_members"
        label="Team members"
        placeholder="Names of everyone working on it"
        multiline
        required
        maxLength={maxLength.team_members}
        defaultValue={values.team_members}
        error={errors?.team_members}
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent py-2.5 font-heading text-[0.9375rem] font-semibold text-on-accent transition-[opacity,scale] hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}

          {!pending && (
            <ArrowIcon className="h-4 w-4" />
          )}
        </button>

        <Link
          href={`/ideas/${idea.id}`}
          className="flex items-center justify-center rounded-lg border border-line px-6 py-2.5 font-heading text-sm font-semibold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
