import { createClient } from "@supabase/supabase-js";
import { formatInvestorDetail } from "@/lib/contact/contactRequests";

// Only call this from server code (the contact server action): it uses secret keys.
// IH-42: emails the idea's author about a new contact request, with the investor as reply-to so the
// author can answer straight from their inbox.
//
// Off until the team picks an email service: with any of these unset it does nothing, and the request
// is still saved for IH-43. Set them in Vercel (server-only, never NEXT_PUBLIC_):
//   RESEND_API_KEY        key from resend.com
//   CONTACT_EMAIL_FROM    sender, e.g. "IdeaHub UPM <contact@your-verified-domain>"
//   SUPABASE_SECRET_KEY   Supabase secret key, to look up the author's email (auth.users isn't readable
//                         with the publishable key)
// To use another service, only sendEmail() below changes.

export type ContactNotification = {
  authorId: string;
  ideaTitle: string;
  ideaUrl: string;
  requesterEmail: string;
  investorName: string | null;
  investorOrganisation: string | null;
  message: string;
};

export type NotifyResult = "sent" | "not-configured" | "failed";

// The three settings above, or null until all of them are set. Also used by notifyReply (IH-106).
export function emailSettings(): { apiKey: string; from: string; secretKey: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_EMAIL_FROM;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!apiKey || !from || !secretKey) return null;
  return { apiKey, from, secretKey };
}

export async function notifyTeam(notification: ContactNotification): Promise<NotifyResult> {
  const settings = emailSettings();
  if (!settings) return "not-configured";
  const { apiKey, from, secretKey } = settings;

  try {
    const authorEmail = await findUserEmail(notification.authorId, secretKey);
    if (!authorEmail) {
      console.error(`Contact request: no email for author ${notification.authorId}`);
      return "failed";
    }
    await sendEmail(apiKey, {
      from,
      to: authorEmail,
      replyTo: notification.requesterEmail,
      subject: `Someone wants to talk about “${notification.ideaTitle}”`,
      text: contactEmailText(notification),
    });
    return "sent";
  } catch (error) {
    // The request is already saved; a failed email must not lose it or show an error to the investor.
    console.error("Contact request: email not sent", error);
    return "failed";
  }
}

export function contactEmailText({
  ideaTitle,
  ideaUrl,
  requesterEmail,
  investorName,
  investorOrganisation,
  message,
}: ContactNotification) {
  return [
    `${formatInvestorDetail(investorName)} (${formatInvestorDetail(investorOrganisation)}` +
      `) wants to contact the team behind “${ideaTitle}” on IdeaHub UPM.`,
    `Email: ${requesterEmail}`,
    "",
    "Their message:",
    "",
    message,
    "",
    `Reply to this email to answer them. Your idea: ${ideaUrl}`,
  ].join("\n");
}

export async function findUserEmail(userId: string, secretKey: string): Promise<string | null> {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) throw error;
  return data.user?.email ?? null;
}

// replyTo is optional: the reply emails (IH-106) send people back to the site instead.
type Email = { from: string; to: string; replyTo?: string; subject: string; text: string };

export async function sendEmail(apiKey: string, email: Email) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: email.from,
      to: [email.to],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend answered ${response.status}: ${await response.text()}`);
  }
}
