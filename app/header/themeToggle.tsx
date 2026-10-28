"use client";

import { toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-soft"
    >
      Dark mode
      <span className="relative ml-auto h-4 w-7 rounded-full bg-line dark:bg-accent">
        <span className="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-card transition-transform dark:translate-x-3" />
      </span>
    </button>
  );
}
