// Shapes and helpers for the messages table (supabase/migrations/010_messages.sql):
// the replies under a contact request (story IH-73).

export type Message = {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export const messageColumns = "id, request_id, sender_id, body, created_at";

// Same limit as the check constraint in 010_messages.sql.
export const replyMaxLength = 1000;

// What the reply form (IH-105) sends: the request and the reply text.
export type ReplyInput = { request_id: string; body: string };

export function readReplyInput(formData: FormData): ReplyInput {
  return {
    request_id: String(formData.get("request_id") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
  };
}

// Returns the reply's error, or null when it can be saved.
export function validateReply(body: string): string | null {
  if (body === "") return "Write a reply.";
  if (body.length > replyMaxLength) return `Use at most ${replyMaxLength} characters.`;
  return null;
}

// The replies of one request, in the order given (oldest first).
export function repliesTo(requestId: string, messages: Message[]): Message[] {
  return messages.filter((message) => message.request_id === requestId);
}
