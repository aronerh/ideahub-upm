import Link from "next/link";
import { AccountMenu } from "@/app/header/accountMenu";
import { getCurrentUser } from "@/lib/auth/currentUser";

export async function UserMenu() {
  const user = await getCurrentUser();
  // Points at the home page until IH-10 adds the idea form.
  const publishHref = user ? "/" : "/sign-in";

  return (
    <>
      {!user && (
        <Link href="/sign-in" className="whitespace-nowrap text-sm font-medium text-accent hover:underline">
          Sign in
        </Link>
      )}
      <Link
        href={publishHref}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 font-heading text-xs font-semibold text-on-accent hover:opacity-90"
      >
        <span aria-hidden="true" className="text-base leading-none">+</span>
        Publish<span className="hidden sm:inline"> an idea</span>
      </Link>
      {user && <AccountMenu email={user.email} />}
    </>
  );
}
