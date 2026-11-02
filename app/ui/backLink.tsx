import Link from "next/link";
import { ArrowIcon } from "@/app/ui/arrowIcon";

export function BackLink() {
  return (
    <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
      <ArrowIcon className="h-4 w-4 rotate-180" />
      All ideas
    </Link>
  );
}
