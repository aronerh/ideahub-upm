"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const isActive = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className="flex h-full items-center border-b-2 border-transparent text-sm text-ink-soft hover:text-ink aria-[current=page]:border-accent aria-[current=page]:font-medium aria-[current=page]:text-ink"
    >
      {children}
    </Link>
  );
}
