import { emailSettings, findUserEmail, sendEmail, type NotifyResult } from "@/lib/contact/notifyTeam";

// Only call this from server code (the reply server action): it uses secret keys.
// IH-106 (story IH-73): emails the other side of a contact request when someone replies on the site.
// An investor's reply goes to the idea's author; the author's reply goes to the investor's email.
// The email carries the reply and a link to the idea page, with no reply-to: the answer belongs on the
// site, and this way neither side sees the other's address unless they already had it.
// Uses the same settings as notifyTeam and does nothing until they are set.

export type ReplyNotification = {
  senderId: string;
  requesterId: string;
  requesterEmail: string;
  authorId: string;
  ideaTitle: string;
  ideaUrl: string;
  body: string;
};

export async function notifyReply(notification: ReplyNotification): Promise<NotifyResult> {
  const settings = emailSettings();
  if (!settings) return "not-configured";
  const { apiKey, from, secretKey } = settings;

  const fromInvestor = notification.senderId === notification.requesterId;
  if (!fromInvestor && notification.senderId !== notification.authorId) {
    console.error(`Reply: sender ${notification.senderId} is on neither side of the request`);
    return "failed";
  }

  try {
    const to = fromInvestor
      ? await findUserEmail(notification.authorId, secretKey)
      : notification.requesterEmail;
    if (!to) {
      console.error(`Reply: no email for author ${notification.authorId}`);
      return "failed";
    }
    await sendEmail(apiKey, {
      from,
      to,
      subject: `New reply about “${notification.ideaTitle}”`,
      text: replyEmailText(notification),
    });
    return "sent";
  } catch (error) {
    // The reply is already saved; a failed email must not lose it or show an error to the sender.
    console.error("Reply: email not sent", error);
    return "failed";
  }
}

export function replyEmailText({
  senderId,
  requesterId,
  ideaTitle,
  ideaUrl,
  body,
}: ReplyNotification) {
  const who = senderId === requesterId ? "The investor" : "The team behind the idea";
  return [
    `${who} replied to your conversation about “${ideaTitle}” on IdeaHub UPM.`,
    "",
    "Their reply:",
    "",
    body,
    "",
    `Read it and answer on the site: ${ideaUrl}`,
  ].join("\n");
}
