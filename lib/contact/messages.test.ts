import { describe, expect, it } from "vitest";
import {
  type Message,
  readReplyInput,
  repliesTo,
  replyMaxLength,
  validateReply,
} from "@/lib/contact/messages";

// IH-105: the rules for a reply, with no database or mocks.

function formWith(values: Record<string, string>) {
  const formData = new FormData();
  for (const [field, value] of Object.entries(values)) {
    formData.set(field, value);
  }
  return formData;
}

describe("readReplyInput", () => {
  it("trims spaces around the request id and the reply, and keeps line breaks inside", () => {
    const input = readReplyInput(formWith({ request_id: "  abc  ", body: "  Monday works.\n\nSee you then.\n" }));

    expect(input).toEqual({ request_id: "abc", body: "Monday works.\n\nSee you then." });
  });

  it("reads missing fields as empty text instead of failing", () => {
    expect(readReplyInput(new FormData())).toEqual({ request_id: "", body: "" });
  });
});

describe("validateReply", () => {
  it("accepts a normal reply", () => {
    expect(validateReply("Monday works.")).toBeNull();
  });

  it("asks for a reply when it is empty", () => {
    expect(validateReply("")).toBe("Write a reply.");
  });

  it("asks for a reply when the form only had spaces and line breaks", () => {
    const { body } = readReplyInput(formWith({ request_id: "abc", body: " \n\t " }));

    expect(validateReply(body)).toBe("Write a reply.");
  });

  it("accepts a reply of exactly the maximum length and rejects one more", () => {
    expect(validateReply("a".repeat(replyMaxLength))).toBeNull();
    expect(validateReply("a".repeat(replyMaxLength + 1))).toBe("Use at most 1000 characters.");
  });

  it("keeps the maximum at 1000, the limit the database enforces", () => {
    expect(replyMaxLength).toBe(1000);
  });
});

describe("repliesTo", () => {
  const reply = (id: string, request_id: string): Message => ({
    id,
    request_id,
    sender_id: "user-1",
    body: id,
    created_at: "2026-11-26T10:00:00Z",
  });

  it("keeps only the replies of that request, in the order given", () => {
    const all = [reply("m1", "r1"), reply("m2", "r2"), reply("m3", "r1")];

    expect(repliesTo("r1", all).map((message) => message.id)).toEqual(["m1", "m3"]);
  });

  it("returns nothing for a request nobody replied to", () => {
    expect(repliesTo("r9", [reply("m1", "r1")])).toEqual([]);
  });
});
