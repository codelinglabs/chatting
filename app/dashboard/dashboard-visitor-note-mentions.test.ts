import {
  applyVisitorNoteMention,
  buildVisitorNoteMentionWarning,
  findActiveVisitorNoteMention,
  getVisitorNoteMentionSuggestions
} from "./dashboard-visitor-note-mentions";

describe("dashboard visitor note mention helpers", () => {
  it("detects the active @query at the cursor", () => {
    expect(findActiveVisitorNoteMention("Please ask @ti", 14)).toEqual({
      query: "ti",
      start: 11,
      end: 14
    });
    expect(findActiveVisitorNoteMention("Please ask Tina", 14)).toBeNull();
  });

  it("filters mention suggestions by canonical handle or display name", () => {
    const users = [
      { userId: "user_tina", displayName: "Tina Bauer", handle: "tina-bauer" },
      { userId: "user_alex", displayName: "Alex Stone", handle: "alex-stone" }
    ];

    expect(getVisitorNoteMentionSuggestions(users, "ti")).toEqual([
      { userId: "user_tina", displayName: "Tina Bauer", handle: "tina-bauer" }
    ]);
    expect(getVisitorNoteMentionSuggestions(users, "stone")).toEqual([
      { userId: "user_alex", displayName: "Alex Stone", handle: "alex-stone" }
    ]);
  });

  it("applies the selected canonical handle into the note", () => {
    const mention = findActiveVisitorNoteMention("Please ask @ti today", 14);
    expect(mention).not.toBeNull();
    expect(
      applyVisitorNoteMention("Please ask @ti today", mention!, "tina-bauer")
    ).toEqual({
      value: "Please ask @tina-bauer today",
      cursor: 22
    });
  });

  it("builds a warning summary for unresolved mention issues", () => {
    expect(
      buildVisitorNoteMentionWarning({
        ambiguous: ["tina"],
        unresolved: ["nobody"],
        disabled: ["alex"]
      })
    ).toBe(
      "Pick a more specific teammate for @tina. We couldn't match @nobody. Mention notifications are off for @alex."
    );
  });
});
