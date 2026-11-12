
"use client";

import { useState, useTransition } from "react";
import { deleteIdea } from "@/app/ideas/actions";

export function DeleteIdeaButton({ ideaId }: { ideaId: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      try {
        await deleteIdea(ideaId);
      } catch {
        setError("Could not delete the idea. Please try again.");
      }
    });
  }

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
      >
        Delete idea
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-medium">
        Are you sure you want to delete this idea?
      </p>

      <p className="text-sm text-ink-soft">
        This action cannot be undone.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Yes, delete"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsConfirming(false);
            setError(null);
          }}
          disabled={isPending}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
