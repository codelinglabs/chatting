import {
  getActivationReminderKey,
  isGrowthNudgeDue,
  shouldSendAnalyticsExpansionReminder,
  shouldSendHealthReminder,
  shouldSendTeamExpansionReminder
} from "@/lib/growth-outreach-rules";

describe("growth outreach rules", () => {
  it("starts the early activation reminder once the first six hours pass", () => {
    expect(
      getActivationReminderKey(
        "2026-03-29T00:00:00.000Z",
        "countdown",
        new Date("2026-03-29T07:00:00.000Z")
      )
    ).toBe("activation-live-no-chat");
  });

  it("sends the late activation reminder after the first-day window is missed", () => {
    expect(
      getActivationReminderKey(
        "2026-03-28T00:00:00.000Z",
        "stalled",
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toBe("activation-missed-first-day");
  });

  it("respects cooldown windows for repeat nudges", () => {
    expect(isGrowthNudgeDue("2026-03-29T00:00:00.000Z", 24, new Date("2026-03-29T12:00:00.000Z"))).toBe(false);
    expect(isGrowthNudgeDue("2026-03-27T00:00:00.000Z", 24, new Date("2026-03-29T12:00:00.000Z"))).toBe(true);
  });

  it("only sends health reminders once there is enough usage to judge", () => {
    expect(shouldSendHealthReminder("at-risk", 2)).toBe(false);
    expect(shouldSendHealthReminder("at-risk", 3)).toBe(true);
    expect(shouldSendHealthReminder("watch", 8)).toBe(false);
  });

  it("flags team and analytics expansion moments", () => {
    expect(shouldSendTeamExpansionReminder("starter", 2)).toBe(true);
    expect(shouldSendTeamExpansionReminder("growth", 4)).toBe(false);
    expect(shouldSendAnalyticsExpansionReminder("starter", 10, 1)).toBe(true);
    expect(shouldSendAnalyticsExpansionReminder("growth", 3, 2)).toBe(false);
  });
});
