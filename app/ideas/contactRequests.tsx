import { ReplyThread } from "@/app/ideas/replyThread";
import { formatInvestorDetail, type ContactRequest } from "@/lib/contact/contactRequests";
import { type Message, repliesTo } from "@/lib/contact/messages";
import { formatIdeaDate } from "@/lib/ideas/ideas";

// IH-43: the idea's author sees who asked to contact the team, newest first.
// IH-105: each request has its thread of replies, so the team can answer on the site.
export function ContactRequests({
  requests,
  messages,
  userId,
}: {
  requests: ContactRequest[];
  messages: Message[];
  userId: string;
}) {
  return (
    <section
      aria-labelledby="contact-requests-heading"
      className="mt-6 rounded-xl border border-line bg-card p-6 shadow-lift sm:p-10"
    >
      <h2 id="contact-requests-heading" className="font-heading text-xl font-semibold tracking-tight">
        Contact requests
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Only you can see these. Reply here or by email.</p>

      {requests.length === 0 ? (
        <p className="mt-6 text-ink-soft">No requests yet.</p>
      ) : (
        <ul aria-label="Contact requests" className="mt-2">
          {requests.map((request) => (
            <li key={request.id} className="border-t border-line pt-4 mt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <a
                  href={`mailto:${request.requester_email}`}
                  className="font-medium text-accent break-all hover:underline"
                >
                  {request.requester_email}
                </a>
                <time dateTime={request.created_at} className="text-xs text-ink-soft">
                  {formatIdeaDate(request.created_at)}
                </time>
              </div>
              <div className="mt-2 text-sm text-ink-soft">
                <span className="font-medium text-ink">
                  {formatInvestorDetail(request.investor_name)}
                </span>
                {" · "}
                <span>{formatInvestorDetail(request.investor_organisation)}</span>
              </div>
              <p className="mt-2 max-w-prose whitespace-pre-line break-words leading-relaxed">
                {request.message}
              </p>
              <ReplyThread
                requestId={request.id}
                messages={repliesTo(request.id, messages)}
                userId={userId}
                otherSide={investorLabel(request)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Who wrote the replies that aren't the author's: the investor's name, or their email when legacy requests have none.
function investorLabel(request: ContactRequest): string {
  const name = request.investor_name?.trim();
  return name ? name : request.requester_email;
}
