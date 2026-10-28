export function CheckEmail({ email }: { email: string }) {
  return (
    <div role="status" className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-soft">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>
      <h1 className="mt-4 font-heading text-xl font-semibold">Check your email</h1>
      <p className="mt-2 max-w-xs text-sm text-ink-soft">
        We sent a confirmation link to{" "}
        <span className="font-medium text-ink">{email}</span>. Open it to finish
        creating your account.
      </p>
    </div>
  );
}
