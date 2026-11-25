import Link from "next/link";
import { AccountMenu } from "@/app/header/accountMenu";
import { RequestsBadge } from "@/app/header/requestsBadge";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { listUnreadContactRequests } from "@/lib/contact/queries";

export async function UserMenu() {
  const user = await getCurrentUser();
  const publishHref = user ? "/ideas/new" : "/sign-in";
  // IH-97: the header is on every page, so a failed count hides the badge instead of breaking the page.
  const unread = user ? await listUnreadContactRequests(user.id).catch(() => []) : [];

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
      {unread.length > 0 && <RequestsBadge count={unread.length} ideaId={unread[0].idea_id} />}
      {user && <AccountMenu email={user.email} />}
    </>
  );
}
