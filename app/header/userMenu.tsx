import Link from "next/link";
import { AccountMenu } from "@/app/header/accountMenu";
import { getCurrentUser } from "@/lib/auth/currentUser";

export async function UserMenu() {
  const user = await getCurrentUser();
  const publishHref = user ? "/ideas/new" : "/sign-in";

  return (
    <>
      {!user && (
        <Link href="/sign-in" className="whitespace-nowrap text-sm font-medium text-ink-soft hover:text-ink">
          Sign in
        </Link>
      )}
      <Link
        href={publishHref}
        className="whitespace-nowrap rounded-lg bg-accent px-4 py-2 font-heading text-sm font-semibold text-on-accent shadow-glow transition-[opacity,scale] hover:opacity-90 active:scale-[0.98]"
      >
        Publish<span className="hidden sm:inline"> an idea</span>
      </Link>
      {user && <AccountMenu email={user.email} />}
    </>
  );
}
