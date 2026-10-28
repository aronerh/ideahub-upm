import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/app/header/logo";
import { NavLink } from "@/app/header/navLink";
import { UserMenu } from "@/app/header/userMenu";

export function SiteHeader() {
  return (
    <header className="border-t-[3px] border-b border-t-accent border-b-line bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-8">
        <Link href="/" aria-label="IdeaHub UPM home">
          <Logo />
        </Link>
        <nav className="hidden h-full sm:flex">
          <NavLink href="/">Explore ideas</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Suspense fallback={<div className="h-8 w-32" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
