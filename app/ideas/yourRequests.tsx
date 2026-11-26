import { ReplyThread } from "@/app/ideas/replyThread";
import type { ContactRequest } from "@/lib/contact/contactRequests";
import { type Message, repliesTo } from "@/lib/contact/messages";
import { formatIdeaDate } from "@/lib/ideas/ideas";

// IH-105 (story IH-73): an investor sees what they sent to this idea's team and the replies, and can answer.
// Renders nothing until the investor has sent a request.
export function YourRequests({
  requests,
  messages,
  userId,
}: {
  requests: ContactRequest[];
  messages: Message[];
  userId: string;
}) {
  if (requests.length === 0) return null;

  return (
    <section
      aria-labelledby="your-requests-heading"
      className="mt-10 rounded-xl border border-line bg-card p-5 sm:p-6"
    >
      <h2 id="your-requests-heading" className="font-heading text-2xl font-semibold tracking-tight">
        Your messages to the team
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Only you and the team can see these.</p>

      <ul aria-label="Your requests" className="mt-2">
        {requests.map((request) => (
          <li key={request.id} className="border-t border-line pt-4 mt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-ink-soft">
              <span className="font-medium text-ink">You</span>
              <time dateTime={request.created_at}>{formatIdeaDate(request.created_at)}</time>
            </div>
            <p className="mt-1 max-w-prose whitespace-pre-line break-words leading-relaxed">{request.message}</p>
            <ReplyThread
              requestId={request.id}
              messages={repliesTo(request.id, messages)}
              userId={userId}
              otherSide="The team"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
