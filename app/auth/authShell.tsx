import type { ReactNode } from "react";
import { LogoMark } from "@/app/header/logo";

type AuthShellProps = {
  tagline: string;
  subline: string;
  children: ReactNode;
};

export function AuthShell({ tagline, subline, children }: AuthShellProps) {
  return (
    <main className="flex flex-1 items-start justify-center p-4 sm:px-8 sm:pt-14">
      <div className="grid w-full max-w-[62.5rem] overflow-hidden rounded-xl border border-line bg-card shadow-lift md:min-h-[32.5rem] md:grid-cols-2">
        <section className="hidden flex-col justify-between gap-8 bg-soft bg-[radial-gradient(420px_300px_at_80%_10%,var(--glow),transparent_75%)] p-10 md:flex">
          <LogoMark className="h-20 w-20" />
          <div>
            <p className="font-heading text-3xl font-semibold leading-tight tracking-tight">{tagline}</p>
            <p className="mt-2 text-ink-soft">{subline}</p>
          </div>
        </section>
        <section className="flex flex-col justify-center p-5 sm:p-10">
          {children}
        </section>
      </div>
    </main>
  );
}
