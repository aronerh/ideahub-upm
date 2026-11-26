"use client";

import { useActionState } from "react";
import { replyToRequest, type ReplyFormState } from "@/app/ideas/replyActions";
import { replyMaxLength } from "@/lib/contact/messages";

const initialState: ReplyFormState = {};

// IH-105 (story IH-73): the box under a contact request where either side writes a reply.
// Posts to the replyToRequest server action. Every request has its own form, so the ids carry the request.
export function ReplyForm({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState(replyToRequest, initialState);
  const fieldId = `reply-${requestId}`;
  const errorId = `${fieldId}-error`;

  return (
    <form action={formAction} noValidate className="mt-4 flex flex-col gap-1">
      <input type="hidden" name="request_id" value={requestId} />

      {state.formError && (
        <p role="alert" className="mb-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.formError}
        </p>
      )}

      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        Your reply
      </label>
      <textarea
        id={fieldId}
        name="body"
        rows={3}
        required
        maxLength={replyMaxLength}
        defaultValue={state.body}
        aria-invalid={Boolean(state.bodyError)}
        aria-describedby={state.bodyError ? errorId : undefined}
        className="resize-y rounded-lg border border-line bg-page px-3 py-2 text-[0.9375rem] text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-danger"
      />
      {state.bodyError && (
        <p id={errorId} className="text-xs text-danger">
          {state.bodyError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start rounded-lg bg-accent px-4 py-2 font-heading text-[0.9375rem] font-semibold text-on-accent transition-[opacity,scale] hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}
