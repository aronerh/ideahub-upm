// Shapes and helpers for the contact_requests table (supabase/migrations/003_contact_requests.sql).

export type ContactRequest = {
  id: string;
  idea_id: string;
  requester_email: string;
  investor_name: string | null;
  investor_organisation: string | null;
  message: string;
  created_at: string;
  // IH-96: null until the author has seen the request.
  read_at: string | null;
};

// Legacy requests have null values for these fields.
export const investorDetailsFallback = "Not provided";
export function formatInvestorDetail(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : investorDetailsFallback;
}

// Columns IH-43 can show to the idea's team.
export const contactRequestColumns =
  "id, idea_id, requester_email, investor_name, investor_organisation, message, created_at, read_at";

// What the "Contact the team" form (IH-41) sends: the idea and the investor's message.
export type ContactInput = {
  idea_id: string;
  investor_name: string;
  investor_organisation: string;
  message: string;
};

// Named limits mirror the checks in 009_investor_details.sql.
export const investorNameMaxLength = 100;
export const investorOrganisationMaxLength = 120;

// Same limit as the check constraint in 003_contact_requests.sql.
export const contactMessageMaxLength = 1000;

export function readContactInput(formData: FormData): ContactInput {
  return {
    idea_id: String(formData.get("idea_id") ?? "").trim(),
    investor_name: String(formData.get("investor_name") ?? "").trim(),
    investor_organisation: String(formData.get("investor_organisation") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };
}

export function validateContactDetails(values: Pick<ContactInput, "investor_name" | "investor_organisation">): {
  investorNameError?: string;
  investorOrganisationError?: string;
} {
  const errors: { investorNameError?: string; investorOrganisationError?: string } = {};

  if (values.investor_name === "") {
    errors.investorNameError = "Write your name.";
  } else if (values.investor_name.length > investorNameMaxLength) {
    errors.investorNameError = `Use at most ${investorNameMaxLength} characters.`;
  }

  if (values.investor_organisation === "") {
    errors.investorOrganisationError = "Write the organisation you represent.";
  } else if (values.investor_organisation.length > investorOrganisationMaxLength) {
    errors.investorOrganisationError = `Use at most ${investorOrganisationMaxLength} characters.`;
  }

  return errors;
}

// Returns the message's error, or null when it can be saved.
export function validateContactMessage(message: string): string | null {
  if (message === "") return "Write a message for the team.";
  if (message.length > contactMessageMaxLength) {
    return `Use at most ${contactMessageMaxLength} characters.`;
  }
  return null;
}
