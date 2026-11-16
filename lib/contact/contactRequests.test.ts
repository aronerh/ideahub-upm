import { describe, expect, it } from "vitest";
import {
  contactMessageMaxLength,
  readContactInput,
  validateContactMessage,
} from "@/lib/contact/contactRequests";

// IH-44: the rules for what an investor can send, with no database, email or mocks.

function formWith(values: Record<string, string>) {
  const formData = new FormData();
  for (const [field, value] of Object.entries(values)) {
    formData.set(field, value);
  }
  return formData;
}

describe("readContactInput", () => {
  it("trims spaces around the idea id and the message", () => {
    const input = readContactInput(formWith({ idea_id: "  abc  ", message: "  Let's talk.\n" }));

    expect(input).toEqual({ idea_id: "abc", message: "Let's talk." });
  });

  it("keeps line breaks inside the message", () => {
    const input = readContactInput(formWith({ idea_id: "abc", message: "Hi,\n\nI'd like to fund this." }));

    expect(input.message).toBe("Hi,\n\nI'd like to fund this.");
  });

  it("reads missing fields as empty text instead of failing", () => {
    expect(readContactInput(new FormData())).toEqual({ idea_id: "", message: "" });
  });
});

describe("validateContactMessage", () => {
  it("accepts a normal message", () => {
    expect(validateContactMessage("I'd like to fund this.")).toBeNull();
  });

  it("asks for a message when it is empty", () => {
    expect(validateContactMessage("")).toBe("Write a message for the team.");
  });

  it("asks for a message when the form only had spaces", () => {
    const { message } = readContactInput(formWith({ idea_id: "abc", message: "   \n  " }));

    expect(validateContactMessage(message)).toBe("Write a message for the team.");
  });

  it("accepts a message of exactly the maximum length", () => {
    expect(validateContactMessage("a".repeat(contactMessageMaxLength))).toBeNull();
  });

  it("rejects a message one character over the maximum", () => {
    expect(validateContactMessage("a".repeat(contactMessageMaxLength + 1))).toBe(
      "Use at most 1000 characters.",
    );
  });

  it("keeps the maximum at 1000, the limit the database enforces", () => {
    expect(contactMessageMaxLength).toBe(1000);
  });
});
