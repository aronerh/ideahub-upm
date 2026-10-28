"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { ThemeToggle } from "@/app/header/themeToggle";

export function AccountMenu({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = email.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex items-center gap-1 text-ink-soft"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent bg-soft text-xs font-semibold text-on-soft">
          {initials}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-10 w-56 rounded-xl border border-line bg-card p-1.5 text-sm">
          <div className="mb-1 border-b border-line px-3 py-2">
            <p className="font-medium">Signed in as</p>
            <p className="truncate text-ink-soft">{email}</p>
          </div>
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-accent hover:bg-soft"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
