import { ReplyForm } from "@/app/ideas/replyForm";
import type { Message } from "@/lib/contact/messages";
import { formatIdeaDate } from "@/lib/ideas/ideas";

// IH-105 (story IH-73): the replies under one contact request, oldest first, and the box to add one.
// `otherSide` names who wrote the replies that aren't the signed-in user's.
export function ReplyThread({
  requestId,
  messages,
  userId,
  otherSide,
}: {
  requestId: string;
  messages: Message[];
  userId: string;
  otherSide: string;
}) {
  return (
    <div className="mt-4 border-l-2 border-line pl-4">
      {messages.length > 0 && (
        <ul aria-label="Replies" className="flex flex-col gap-3">
          {messages.map((message) => (
            <li key={message.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-ink-soft">
                <span className="font-medium text-ink">{message.sender_id === userId ? "You" : otherSide}</span>
                <time dateTime={message.created_at}>{formatIdeaDate(message.created_at)}</time>
              </div>
              <p className="mt-1 max-w-prose whitespace-pre-line break-words text-sm leading-relaxed">
                {message.body}
              </p>
            </li>
          ))}
        </ul>
      )}
      <ReplyForm requestId={requestId} />
    </div>
  );
}
