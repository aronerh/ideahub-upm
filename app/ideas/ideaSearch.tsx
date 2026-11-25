"use client";

import Form from "next/form";
import Link from "next/link";
import { ChevronIcon } from "@/app/ui/chevronIcon";
import { type IdeaSearch as Search, isFiltering, sectors, stages } from "@/lib/ideas/classification";

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
      className="flex flex-col gap-3"
    >
      <div className="relative">
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
          className="h-12 w-full appearance-none rounded-2xl border border-line bg-card pr-12 pl-11 text-base text-ink shadow-[0_1px_2px_rgb(0_0_0/0.04)] outline-none transition-shadow placeholder:text-ink-soft focus:border-accent/60 focus:ring-4 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {search.query !== "" && (
          <Link
            href={addressFor({ ...search, query: "" })}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-ink-soft/25 text-ink-soft transition-colors hover:bg-ink-soft/40 hover:text-ink"
          >
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              className="size-2.5"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`relative shrink-0 ${search.sector ? "text-on-soft" : "text-ink"}`}>
          <label htmlFor="sector" className="sr-only">
            Sector
          </label>
          <select
            id="sector"
            name="sector"
            defaultValue={search.sector}
            onChange={applySector}
            className={`h-9 w-full cursor-pointer appearance-none rounded-full border py-0 pr-9 pl-4 text-sm font-medium outline-none transition-colors focus-visible:ring-4 focus-visible:ring-accent/15 sm:w-auto ${
              search.sector ? "border-transparent bg-soft text-on-soft" : "border-line bg-card text-ink hover:bg-soft/50"
            }`}
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

        <nav aria-label="Stage" className="flex rounded-full bg-ink-soft/10 p-0.5">
          {[{ value: "", label: "All" } as const, ...stages].map((stage) => {
            const current = search.stage === stage.value;
            return (
              <Link
                key={stage.value || "all"}
                href={addressFor({ ...search, stage: stage.value })}
                aria-current={current ? "true" : undefined}
                scroll={false}
                className={`flex h-8 flex-1 items-center justify-center rounded-full px-3 text-sm whitespace-nowrap transition-all sm:flex-none ${
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
          <Link href="/" className="text-sm font-medium text-accent hover:underline sm:ml-auto">
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
      className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-ink-soft"
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
