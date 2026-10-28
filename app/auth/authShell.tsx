import type { ReactNode } from "react";
import { IdeaIllustration } from "@/app/auth/ideaIllustration";

type AuthShellProps = {
  tagline: string;
  subline: string;
  children: ReactNode;
};

export function AuthShell({ tagline, subline, children }: AuthShellProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-card md:grid-cols-2">
        <section className="hidden flex-col justify-between gap-8 bg-soft p-8 md:flex">
          <IdeaIllustration className="mx-auto w-full max-w-xs" />
          <div>
            <p className="font-heading text-xl font-semibold leading-snug">{tagline}</p>
            <p className="mt-1 text-sm text-ink-soft">{subline}</p>
          </div>
        </section>
        <section className="flex flex-col justify-center p-8 sm:p-10">
          {children}
        </section>
      </div>
    </main>
  );
}
