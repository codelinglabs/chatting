import {
  normalizeResponseToneContext,
  parseResponseToneAnalysis,
  validateResponseToneMessage
} from "@/lib/response-tone-checker";

describe("response tone checker edge cases", () => {
  it("normalizes unknown contexts and message boundary errors", () => {
    expect(normalizeResponseToneContext("closing")).toBe("closing");
    expect(normalizeResponseToneContext("refund")).toBe("general");
    expect(validateResponseToneMessage("   ")).toBe("MISSING_MESSAGE");
    expect(validateResponseToneMessage("x".repeat(2001))).toBe("MESSAGE_TOO_LONG");
  });

  it.each([
    [9, "Excellent"],
    [7, "Good"],
    [5, "Needs Work"],
    [2, "Poor"]
  ])("derives %s as %s when the label is invalid", (score, label) => {
    expect(
      parseResponseToneAnalysis(JSON.stringify({ overall_score: score, overall_label: "invalid" })).overall_label
    ).toBe(label);
  });

  it("parses fenced json and sanitizes incomplete fields", () => {
    const result = parseResponseToneAnalysis(
      '```json\n' +
        '{\n' +
        '  "overall_score": "11",\n' +
        '  "overall_label": "Not a label",\n' +
        '  "dimensions": {\n' +
        '    "friendliness": { "score": "7.4", "note": " Warm tone " },\n' +
        '    "professionalism": { "score": 0, "note": "" },\n' +
        '    "empathy": { "score": "oops", "note": "" },\n' +
        '    "clarity": { "score": 4.4, "note": "Clear enough" },\n' +
        '    "helpfulness": { "score": 10, "note": "Very actionable" }\n' +
        '  },\n' +
        '  "issues": [\n' +
        '    { "text": " Unfortunately ", "issue": "Negative framing", "suggestion": "Lead with what you can do" },\n' +
        '    { "text": "", "issue": "", "suggestion": "" }\n' +
        '  ],\n' +
        '  "strengths": ["Clear next step", " ", "Friendly tone", "Specific", "Useful", "Extra"],\n' +
        '  "rewritten": "  Happy to help. Here is the next step.  "\n' +
        '}\n' +
        '```'
    );

    expect(result.overall_score).toBe(10);
    expect(result.overall_label).toBe("Excellent");
    expect(result.dimensions.friendliness).toEqual({ score: 7, note: "Warm tone" });
    expect(result.dimensions.professionalism).toEqual({ score: 1, note: "No note returned." });
    expect(result.dimensions.empathy).toEqual({ score: 1, note: "No note returned." });
    expect(result.dimensions.clarity.score).toBe(4);
    expect(result.issues).toEqual([
      {
        text: "Unfortunately",
        issue: "Negative framing",
        suggestion: "Lead with what you can do"
      }
    ]);
    expect(result.strengths).toEqual([
      "Clear next step",
      "Friendly tone",
      "Specific",
      "Useful",
      "Extra"
    ]);
    expect(result.rewritten).toBe("Happy to help. Here is the next step.");
  });
});
