// IH-72: only UPM email addresses can publish (IH-30), so every idea's author is a verified UPM student.
export function UpmBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-soft px-2.5 py-0.5 text-xs font-medium text-on-soft">
      UPM student
    </span>
  );
}
