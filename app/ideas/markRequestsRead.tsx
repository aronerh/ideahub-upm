"use client";

import { useEffect } from "react";
import { markContactRequestsRead } from "@/app/ideas/contactActions";

// IH-97: opening the idea page marks its contact requests as read. It runs once the page is on
// screen, not while it renders, so a link prefetch can't mark them by itself.
export function MarkRequestsRead({ ideaId }: { ideaId: string }) {
  useEffect(() => {
    void markContactRequestsRead(ideaId);
  }, [ideaId]);

  return null;
}
