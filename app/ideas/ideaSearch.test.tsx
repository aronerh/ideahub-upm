import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdeaSearch } from "@/app/ideas/ideaSearch";

// IH-14: the search box and filters above the ideas list.

// next/form needs the Next.js router; in tests it's a plain form.
vi.mock("next/form", () => ({
  default: ({ action, ...props }: ComponentProps<"form"> & { action: string }) => (
    <form action={action} {...props} />
  ),
}));

afterEach(cleanup);

const noSearch = { query: "", sector: "", stage: "" } as const;

describe("IdeaSearch", () => {
  it("has a search box and sector and stage filters, all sent to the home page", () => {
    render(<IdeaSearch search={noSearch} />);
    const form = screen.getByRole("search", { name: "Search ideas" });

    expect(form.getAttribute("action")).toBe("/");
    expect(screen.getByRole("searchbox", { name: "Search ideas" }).getAttribute("name")).toBe("q");
    expect(screen.getByRole("combobox", { name: "Sector" }).getAttribute("name")).toBe("sector");
    expect(screen.getByRole("combobox", { name: "Stage" }).getAttribute("name")).toBe("stage");
    expect(screen.getByRole("option", { name: "Software & AI" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "MVP" })).toBeTruthy();
  });

  it("shows the current search, and a way to clear it", () => {
    render(<IdeaSearch search={{ query: "bike", sector: "mobility", stage: "" }} />);

    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("bike");
    expect((screen.getByRole("combobox", { name: "Sector" }) as HTMLSelectElement).value).toBe("mobility");
    expect((screen.getByRole("combobox", { name: "Stage" }) as HTMLSelectElement).value).toBe("");
    expect(screen.getByRole("link", { name: "Clear" }).getAttribute("href")).toBe("/");
  });

  it("has nothing to clear without a search", () => {
    render(<IdeaSearch search={noSearch} />);

    expect(screen.queryByRole("link", { name: "Clear" })).toBeNull();
  });

  it("applies a filter as soon as it's picked", () => {
    render(<IdeaSearch search={noSearch} />);
    const form = screen.getByRole("search") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    fireEvent.change(screen.getByRole("combobox", { name: "Stage" }), { target: { value: "growing" } });

    expect(requestSubmit).toHaveBeenCalled();
  });
});
