import { beforeEach, describe, expect, it, vi } from "vitest";
import { listMessages, listMyContactRequests } from "@/lib/contact/queries";
import { createClient } from "@/lib/supabase/server";

// IH-107: what the reply queries ask Supabase for, without the live database.

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

let result: { data: unknown; error: { message: string } | null };
let calls: unknown[][];

// A stand-in for Supabase's query builder: every step is recorded and awaiting it gives `result`.
function queryBuilder() {
  const builder: Record<string, unknown> = {};
  for (const step of ["select", "eq", "in", "order"]) {
    builder[step] = (...args: unknown[]) => {
      calls.push([step, ...args]);
      return builder;
    };
  }
  builder.then = (resolve: (value: typeof result) => unknown) => resolve(result);
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
  calls = [];
  result = { data: [], error: null };
  vi.mocked(createClient).mockResolvedValue({
    from: (table: string) => {
      calls.push(["from", table]);
      return queryBuilder();
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
});

describe("listMessages", () => {
  it("doesn't ask the database when there are no requests", async () => {
    expect(await listMessages([])).toEqual([]);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("asks for the replies of those requests only, oldest first", async () => {
    const replies = [{ id: "m1", request_id: "r1", sender_id: "u1", body: "Hi", created_at: "2026-11-26T10:00:00Z" }];
    result = { data: replies, error: null };

    expect(await listMessages(["r1", "r2"])).toEqual(replies);
    expect(calls).toContainEqual(["from", "messages"]);
    expect(calls).toContainEqual(["in", "request_id", ["r1", "r2"]]);
    expect(calls).toContainEqual(["order", "created_at", { ascending: true }]);
  });

  it("fails loudly when the database refuses, instead of showing an empty thread", async () => {
    result = { data: null, error: { message: "permission denied for table messages" } };

    await expect(listMessages(["r1"])).rejects.toThrow("permission denied for table messages");
  });
});

describe("listMyContactRequests", () => {
  it("asks only for the requests this user sent about this idea, newest first", async () => {
    await listMyContactRequests("idea-1", "user-1");

    expect(calls).toContainEqual(["from", "contact_requests"]);
    expect(calls).toContainEqual(["eq", "idea_id", "idea-1"]);
    // Without this filter the idea's author would get every request about their idea.
    expect(calls).toContainEqual(["eq", "requester_id", "user-1"]);
    expect(calls).toContainEqual(["order", "created_at", { ascending: false }]);
  });

  it("fails loudly when the database refuses", async () => {
    result = { data: null, error: { message: "boom" } };

    await expect(listMyContactRequests("idea-1", "user-1")).rejects.toThrow("boom");
  });
});
