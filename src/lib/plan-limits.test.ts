import {
  getAutomationPromptLimit,
  getAutomationRuleLimit,
  getContactPlanLimits,
  getDashboardPlanLimits
} from "./plan-limits";

describe("plan limits", () => {
  it("returns starter limits from one shared source", () => {
    expect(getDashboardPlanLimits("starter")).toMatchObject({
      contacts: {
        fullProfiles: false,
        exportEnabled: false,
        apiEnabled: false,
        customStatusesLimit: 1,
        customFieldsLimit: 1
      },
      automation: {
        routingRules: 1,
        proactivePrompts: 1
      }
    });
    expect(getContactPlanLimits("starter").customStatusesLimit).toBe(1);
    expect(getAutomationRuleLimit("starter")).toBe(1);
    expect(getAutomationPromptLimit("starter")).toBe(1);
  });

  it("returns growth limits from one shared source", () => {
    expect(getDashboardPlanLimits("growth")).toMatchObject({
      contacts: {
        fullProfiles: true,
        exportEnabled: true,
        apiEnabled: true,
        customStatusesLimit: null,
        customFieldsLimit: null
      },
      automation: {
        routingRules: null,
        proactivePrompts: null
      }
    });
  });
});
