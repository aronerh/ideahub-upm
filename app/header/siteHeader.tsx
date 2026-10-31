import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/app/header/logo";
import { NavLink } from "@/app/header/navLink";
import { UserMenu } from "@/app/header/userMenu";

export function SiteHeader() {
  return (
    <header>
      <div className="mx-auto flex h-16 max-w-[76rem] items-center gap-4 px-4 sm:gap-8">
        <Link href="/" aria-label="IdeaHub UPM home">
          <Logo />
        </Link>
        <nav className="hidden sm:block">
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
