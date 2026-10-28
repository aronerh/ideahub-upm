const messagesByCode: Record<string, string> = {
  invalid_credentials: "Wrong email or password.",
  email_not_confirmed: "Confirm your email first. The link is in your inbox.",
  user_already_exists: "That email already has an account. Sign in instead.",
  weak_password: "Choose a stronger password.",
  email_address_invalid: "Enter a valid email address.",
  over_email_send_rate_limit: "Too many emails sent. Wait a few minutes and try again.",
  over_request_rate_limit: "Too many attempts. Wait a few minutes and try again.",
};

export function authErrorMessage(code?: string): string {
  return (code && messagesByCode[code]) || "Something went wrong. Try again.";
}
