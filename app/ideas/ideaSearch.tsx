"use client";

import Form from "next/form";
import Link from "next/link";
import { type IdeaSearch as Search, isFiltering, sectors, stages } from "@/lib/ideas/classification";

const controlClass =
  "rounded-lg border border-line bg-card px-3 py-2 text-[0.9375rem] text-ink outline-none placeholder:text-ink-soft focus:border-accent focus:ring-2 focus:ring-accent/20";

// IH-14: search box plus sector and stage filters above the ideas list. They combine, and live in
// the address (/?q=&sector=&stage=), so a filtered list can be shared. Works without JavaScript;
// with it, picking a filter applies it straight away.
export function IdeaSearch({ search }: { search: Search }) {
  const applyFilter = (event: React.ChangeEvent<HTMLSelectElement>) => event.currentTarget.form?.requestSubmit();

  return (
    // The key resets the fields when the address changes, e.g. after "Clear".
    <Form
      key={`${search.query}|${search.sector}|${search.stage}`}
      action="/"
      role="search"
      aria-label="Search ideas"
      className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
    >
      <label htmlFor="q" className="sr-only">
        Search ideas
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={search.query}
        maxLength={100}
        placeholder="Search titles and pitches"
        className={`${controlClass} min-w-0 sm:flex-1`}
      />
      <div className="grid grid-cols-2 gap-2.5 sm:flex">
        <label htmlFor="sector" className="sr-only">
          Sector
        </label>
        <select id="sector" name="sector" defaultValue={search.sector} onChange={applyFilter} className={controlClass}>
          <option value="">All sectors</option>
          {sectors.map((sector) => (
            <option key={sector.value} value={sector.value}>
              {sector.label}
            </option>
          ))}
        </select>
        <label htmlFor="stage" className="sr-only">
          Stage
        </label>
        <select id="stage" name="stage" defaultValue={search.stage} onChange={applyFilter} className={controlClass}>
          <option value="">All stages</option>
          {stages.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:opacity-90 sm:flex-none"
        >
          Search
        </button>
        {isFiltering(search) && (
          <Link href="/" className="px-2 py-2 text-sm font-medium text-ink-soft hover:text-ink">
            Clear
          </Link>
        )}
      </div>
    </Form>
  );
}
