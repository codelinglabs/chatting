import {
  proactiveLimitCopy,
  proactivePathError,
  proactivePromptMeta,
  proactiveUpgradeTitle
} from "./dashboard-settings-automation-proactive-helpers";

describe("dashboard automation proactive helpers", () => {
  it("validates page paths and formats summaries", () => {
    expect(proactivePathError("")).toBe("Enter a page path.");
    expect(proactivePathError("pricing")).toBe("Page path must start with /");
    expect(proactivePathError("/pricing")).toBeNull();
    expect(
      proactivePromptMeta({
        id: "prompt_1",
        pagePath: "/pricing",
        message: "Need help?",
        delaySeconds: 60,
        autoOpenWidget: true
      })
    ).toBe("After 1 minute · Opens widget");
  });

  it("formats finite plan usage and upgrade copy", () => {
    expect(proactiveLimitCopy(1, 1, "Starter Plan")).toBe("1 of 1 rules (Starter Plan)");
    expect(proactiveUpgradeTitle(1)).toBe("You've used your proactive message rule");
    expect(proactiveUpgradeTitle(5)).toBe("You've used all 5 proactive message rules");
  });
});
