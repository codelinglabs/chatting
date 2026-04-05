import {
  createDefaultDashboardAutomationSettings,
  parseDashboardAutomationSettings,
  serializeDashboardAutomationSettings
} from "@/lib/data/settings-automation";

describe("settings automation helpers", () => {
  it("builds defaults from site-backed fallbacks", () => {
    expect(
      createDefaultDashboardAutomationSettings({
        requireEmailWhenOffline: false,
        expectedReplyTimeOnline: "day"
      })
    ).toEqual(
      expect.objectContaining({
        offline: expect.objectContaining({
          expectedReplyTimeOnline: "day",
          leadCapture: expect.objectContaining({ requireEmailWhenOffline: false })
        })
      })
    );
  });

  it("parses invalid payloads back to defaults", () => {
    expect(parseDashboardAutomationSettings("not-json")).toEqual(createDefaultDashboardAutomationSettings());
  });

  it("normalizes stored rules, FAQs, and prompts", () => {
    const parsed = parseDashboardAutomationSettings(
      JSON.stringify({
        routing: {
          assignRules: [{ id: "assign_1", condition: "page_url_contains", value: "/pricing", target: { type: "member", memberId: "user_2" } }],
          tagRules: [{ condition: "first_message_contains", value: "refund", tag: "billing" }]
        },
        speed: {
          manualFaqs: [{ question: "Billing", keywords: ["price", "plan"], answer: "See pricing." }]
        },
        proactive: {
          pagePrompts: [{ pagePath: "/pricing", message: "Need help?", delaySeconds: 60, autoOpenWidget: true }]
        }
      })
    );

    expect(parsed.routing.assignRules[0]).toEqual(expect.objectContaining({ value: "/pricing", target: { type: "member", memberId: "user_2" } }));
    expect(parsed.routing.tagRules[0]).toEqual(expect.objectContaining({ condition: "first_message_contains", tag: "billing" }));
    expect(parsed.speed.manualFaqs[0]).toEqual(expect.objectContaining({ question: "Billing", keywords: ["price", "plan"] }));
    expect(parsed.proactive.pagePrompts[0]).toEqual(expect.objectContaining({ delaySeconds: 60 }));
    expect(JSON.parse(serializeDashboardAutomationSettings(parsed))).toEqual(expect.objectContaining({ routing: expect.any(Object) }));
  });

  it("keeps all stored proactive prompts instead of silently truncating them", () => {
    const prompts = Array.from({ length: 12 }, (_, index) => ({
      id: `prompt_${index + 1}`,
      pagePath: `/page-${index + 1}`,
      message: `Message ${index + 1}`,
      delaySeconds: 30,
      autoOpenWidget: true
    }));

    const parsed = parseDashboardAutomationSettings(JSON.stringify({ proactive: { pagePrompts: prompts } }));

    expect(parsed.proactive.pagePrompts).toHaveLength(12);
    expect(parsed.proactive.pagePrompts[11]).toEqual(expect.objectContaining({ pagePath: "/page-12" }));
  });
});
