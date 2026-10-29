"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";

type NavLinkProps = { href: string; children: ReactNode };

const navLinkClass =
  "flex h-full items-center border-b-2 border-transparent text-sm text-ink-soft hover:text-ink aria-[current=page]:border-accent aria-[current=page]:font-medium aria-[current=page]:text-ink";

// usePathname() is only known at request time on dynamic routes like /ideas/[id], so with
// Cache Components it must sit inside <Suspense>. The fallback is the same link, not highlighted.
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<Link href={props.href} className={navLinkClass}>{props.children}</Link>}>
      <ActiveNavLink {...props} />
    </Suspense>
  );
}

function ActiveNavLink({ href, children }: NavLinkProps) {
  const isActive = usePathname() === href;

  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} className={navLinkClass}>
      {children}
    </Link>
  );
}
