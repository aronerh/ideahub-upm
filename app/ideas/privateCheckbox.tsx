import { privateDetailNotice } from "@/lib/ideas/ideas";

// IH-38: the field above it stays hidden from visitors who aren't signed in.
export function PrivateCheckbox({ name, defaultChecked }: { name: string; defaultChecked?: boolean }) {
  return (
    <label className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-accent" />
      {privateDetailNotice}
    </label>
  );
}
