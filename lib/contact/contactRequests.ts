// Shapes and helpers for the contact_requests table (supabase/migrations/003_contact_requests.sql).

export type ContactRequest = {
  id: string;
  idea_id: string;
  requester_email: string;
  message: string;
  created_at: string;
};

// Columns IH-43 can show to the idea's team.
export const contactRequestColumns = "id, idea_id, requester_email, message, created_at";

// What the "Contact the team" form (IH-41) sends: the idea and the investor's message.
export type ContactInput = {
  idea_id: string;
  message: string;
};

// Same limit as the check constraint in 003_contact_requests.sql.
export const contactMessageMaxLength = 1000;

export function readContactInput(formData: FormData): ContactInput {
  return {
    idea_id: String(formData.get("idea_id") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };
}

// Returns the message's error, or null when it can be saved.
export function validateContactMessage(message: string): string | null {
  if (message === "") return "Write a message for the team.";
  if (message.length > contactMessageMaxLength) {
    return `Use at most ${contactMessageMaxLength} characters.`;
  }
  return null;
}
