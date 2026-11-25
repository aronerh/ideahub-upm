"use client";

import Form from "next/form";
import Link from "next/link";
import { ChevronIcon } from "@/app/ui/chevronIcon";
import { type IdeaSearch as Search, isFiltering, sectors, stages } from "@/lib/ideas/classification";

// Search field and sector menu share one look: filled, no border, the stage control's height.
const fieldClass =
  // 16px on phones so iOS Safari doesn't zoom in when a field is tapped.
  "h-10 appearance-none rounded-xl border-0 bg-ink-soft/10 text-base text-ink outline-none transition-shadow focus:ring-2 focus:ring-accent/40 sm:text-sm";

// IH-14: search field, sector menu and stage segmented control above the ideas list. They combine,
// and live in the address (/?q=&sector=&stage=), so a filtered list can be shared. Everything works
// without JavaScript (Enter searches, stages are links); with it, picking a sector applies at once.
export function IdeaSearch({ search }: { search: Search }) {
  const applySector = (event: React.ChangeEvent<HTMLSelectElement>) => event.currentTarget.form?.requestSubmit();

  return (
    // The key resets the fields when the address changes, e.g. after "Clear filters".
    <Form
      key={`${search.query}|${search.sector}|${search.stage}`}
      action="/"
      role="search"
      aria-label="Search ideas"
      className="flex flex-col gap-2.5 lg:flex-row lg:items-center"
    >
      <div className="relative min-w-0 lg:flex-1">
        <SearchIcon />
        <label htmlFor="q" className="sr-only">
          Search ideas
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={search.query}
          maxLength={100}
          placeholder="Search ideas"
          enterKeyHint="search"
          className={`${fieldClass} w-full pr-10 pl-10 placeholder:text-ink-soft [&::-webkit-search-cancel-button]:hidden`}
        />
        {search.query !== "" && (
          <Link
            href={addressFor({ ...search, query: "" })}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-ink-soft/25 text-ink-soft transition-colors hover:bg-ink-soft/40 hover:text-ink"
          >
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              className="size-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </Link>
        )}
      </div>
      {/* Enter in the search field keeps the stage; the visible stage control is links. */}
      <input type="hidden" name="stage" value={search.stage} />
      <button type="submit" className="sr-only">
        Search
      </button>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative shrink-0 text-ink">
          <label htmlFor="sector" className="sr-only">
            Sector
          </label>
          <select
            id="sector"
            name="sector"
            defaultValue={search.sector}
            onChange={applySector}
            className={`${fieldClass} w-full cursor-pointer pr-9 pl-3.5 font-medium sm:w-52`}
          >
            <option value="">All sectors</option>
            {sectors.map((sector) => (
              <option key={sector.value} value={sector.value}>
                {sector.label}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>

        <nav aria-label="Stage" className="flex h-10 shrink-0 rounded-xl bg-ink-soft/10 p-[3px]">
          {[{ value: "", label: "All" } as const, ...stages].map((stage) => {
            const current = search.stage === stage.value;
            return (
              <Link
                key={stage.value || "all"}
                href={addressFor({ ...search, stage: stage.value })}
                aria-current={current ? "true" : undefined}
                scroll={false}
                className={`flex flex-1 items-center justify-center rounded-[9px] px-3 text-sm whitespace-nowrap transition-all sm:flex-none ${
                  current
                    ? "bg-card font-semibold text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)] dark:bg-ink-soft/30 dark:shadow-none"
                    : "font-medium text-ink-soft hover:text-ink"
                }`}
              >
                {stage.label}
              </Link>
            );
          })}
        </nav>

        {isFiltering(search) && (
          <Link href="/" className="px-1 text-sm font-medium whitespace-nowrap text-ink-soft hover:text-ink">
            Clear filters
          </Link>
        )}
      </div>
    </Form>
  );
}

// The home page's address for a search, leaving out what's empty.
function addressFor(search: Search): string {
  const params = new URLSearchParams();
  if (search.query) params.set("q", search.query);
  if (search.sector) params.set("sector", search.sector);
  if (search.stage) params.set("stage", search.stage);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="M13 13l4 4" />
    </svg>
  );
}
