import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdeaSearch } from "@/app/ideas/ideaSearch";

// IH-14: the search field, sector menu and stage segmented control above the ideas list.

// next/form needs the Next.js router; in tests it's a plain form.
vi.mock("next/form", () => ({
  default: ({ action, ...props }: ComponentProps<"form"> & { action: string }) => (
    <form action={action} {...props} />
  ),
}));

afterEach(cleanup);

const noSearch = { query: "", sector: "", stage: "" } as const;

function stageLinks() {
  return within(screen.getByRole("navigation", { name: "Stage" })).getAllByRole("link");
}

describe("IdeaSearch", () => {
  it("has a search field and a sector menu, sent to the home page", () => {
    render(<IdeaSearch search={noSearch} />);

    expect(screen.getByRole("search", { name: "Search ideas" }).getAttribute("action")).toBe("/");
    expect(screen.getByRole("searchbox", { name: "Search ideas" }).getAttribute("name")).toBe("q");
    expect(screen.getByRole("combobox", { name: "Sector" }).getAttribute("name")).toBe("sector");
    expect(screen.getByRole("option", { name: "Software & AI" })).toBeTruthy();
  });

  it("has a stage control with All selected when no stage is picked", () => {
    render(<IdeaSearch search={noSearch} />);

    expect(stageLinks().map((link) => link.textContent)).toEqual(["All", "Idea", "Prototype", "MVP", "Growing"]);
    expect(screen.getByRole("link", { name: "All" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "MVP" }).getAttribute("href")).toBe("/?stage=mvp");
  });

  it("keeps the search and sector when switching stage", () => {
    render(<IdeaSearch search={{ query: "bike", sector: "mobility", stage: "idea" }} />);

    expect(screen.getByRole("link", { name: "Idea" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "Growing" }).getAttribute("href")).toBe(
      "/?q=bike&sector=mobility&stage=growing",
    );
    expect(screen.getByRole("link", { name: "All" }).getAttribute("href")).toBe("/?q=bike&sector=mobility");
  });

  it("shows the current search, with ways to clear the words or everything", () => {
    render(<IdeaSearch search={{ query: "bike", sector: "mobility", stage: "mvp" }} />);

    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("bike");
    expect((screen.getByRole("combobox", { name: "Sector" }) as HTMLSelectElement).value).toBe("mobility");
    expect(screen.getByRole("link", { name: "Clear search" }).getAttribute("href")).toBe(
      "/?sector=mobility&stage=mvp",
    );
    expect(screen.getByRole("link", { name: "Clear filters" }).getAttribute("href")).toBe("/");
  });

  it("keeps the stage when searching with Enter", () => {
    render(<IdeaSearch search={{ query: "", sector: "", stage: "prototype" }} />);
    const stage = screen.getByRole("search").querySelector('input[type="hidden"][name="stage"]') as HTMLInputElement;

    expect(stage.value).toBe("prototype");
  });

  it("has nothing to clear without a search", () => {
    render(<IdeaSearch search={noSearch} />);

    expect(screen.queryByRole("link", { name: "Clear search" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Clear filters" })).toBeNull();
  });

  it("applies a sector as soon as it's picked", () => {
    render(<IdeaSearch search={noSearch} />);
    const form = screen.getByRole("search") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    fireEvent.change(screen.getByRole("combobox", { name: "Sector" }), { target: { value: "health" } });

    expect(requestSubmit).toHaveBeenCalled();
  });
});
