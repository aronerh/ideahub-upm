// Only UPM emails can publish ideas; anyone can sign up and browse.
// Keep in sync with public.is_upm_email in supabase/migrations/001_upm_email_domain.sql.
export const allowedEmailDomains = [
  "alumnos.upm.es",
  "upm.es",
  "fi.upm.es",
  "dit.upm.es",
];

export const emailDomainError =
  "Only UPM emails (@alumnos.upm.es, @upm.es, @fi.upm.es or @dit.upm.es) can publish ideas.";

export function isUpmEmail(email: string): boolean {
  const atIndex = email.lastIndexOf("@");
  const domain = email.slice(atIndex + 1);
  return atIndex > 0 && allowedEmailDomains.includes(domain);
}
