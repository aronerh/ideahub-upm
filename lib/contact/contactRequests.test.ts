import { describe, expect, it } from "vitest";
import {
  contactMessageMaxLength,
  investorNameMaxLength,
  investorOrganisationMaxLength,
  readContactInput,
  validateContactDetails,
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
  it("trims spaces around the idea id, investor details, and message", () => {
    const input = readContactInput(
      formWith({
        idea_id: "  abc  ",
        investor_name: "  Laura Investor  ",
        investor_organisation: "  Investor Fund  ",
        message: "  Let's talk.\n",
      }),
    );

    expect(input).toEqual({
      idea_id: "abc",
      investor_name: "Laura Investor",
      investor_organisation: "Investor Fund",
      message: "Let's talk.",
    });
  });

  it("keeps line breaks inside the message", () => {
    const input = readContactInput(formWith({ idea_id: "abc", message: "Hi,\n\nI'd like to fund this." }));

    expect(input.message).toBe("Hi,\n\nI'd like to fund this.");
  });

  it("reads missing fields as empty text instead of failing", () => {
    expect(readContactInput(new FormData())).toEqual({
      idea_id: "",
      investor_name: "",
      investor_organisation: "",
      message: "",
    });
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

describe("validateContactDetails", () => {
  it("asks for both investor details", () => {
    expect(validateContactDetails({ investor_name: "", investor_organisation: "" })).toEqual({
      investorNameError: "Write your name.",
      investorOrganisationError: "Write the organisation you represent.",
    });
  });

  it("asks for the investor name with the exact error", () => {
    expect(validateContactDetails({ investor_name: "", investor_organisation: "Fund" })).toEqual({
      investorNameError: "Write your name.",
    });
  });

  it("asks for the organisation with the exact error", () => {
    expect(validateContactDetails({ investor_name: "Laura Investor", investor_organisation: "" })).toEqual({
      investorOrganisationError: "Write the organisation you represent.",
    });
  });

  it("accepts details at the maximum lengths", () => {
    expect(
      validateContactDetails({
        investor_name: "a".repeat(investorNameMaxLength),
        investor_organisation: "a".repeat(investorOrganisationMaxLength),
      }),
    ).toEqual({});
  });

  it("rejects details one character over their maximum lengths", () => {
    expect(
      validateContactDetails({
        investor_name: "a".repeat(investorNameMaxLength + 1),
        investor_organisation: "a".repeat(investorOrganisationMaxLength + 1),
      }),
    ).toEqual({
      investorNameError: "Use at most 100 characters.",
      investorOrganisationError: "Use at most 120 characters.",
    });
  });
});
