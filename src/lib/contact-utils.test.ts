import {
  DEFAULT_CONTACT_STATUSES,
  decodeContactId,
  encodeContactId,
  parseContactSettingsJson
} from "./contact-utils";

describe("contact utils", () => {
  it("encodes and decodes contact ids", () => {
    const encoded = encodeContactId("site_123", "Tina@Acme.com");

    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodeContactId(encoded)).toEqual({
      siteId: "site_123",
      email: "tina@acme.com"
    });
    expect(decodeContactId("not-valid")).toBeNull();
  });

  it("normalizes workspace contact settings by plan", () => {
    const parsed = parseContactSettingsJson(JSON.stringify({
      statuses: [
        ...DEFAULT_CONTACT_STATUSES,
        { key: "vip-plus", label: "VIP+", color: "amber" }
      ],
      customFields: [
        { id: "1", key: "plan", label: "Plan", type: "dropdown", options: ["Free", "Pro"], prefix: null }
      ],
      dataRetention: "2y"
    }), "growth");

    expect(parsed.statuses).toHaveLength(1);
    expect(parsed.customFields).toHaveLength(1);
    expect(parsed.dataRetention).toBe("2y");

    const starterParsed = parseContactSettingsJson(JSON.stringify(parsed), "starter");
    expect(starterParsed.statuses).toEqual(parsed.statuses);
    expect(starterParsed.customFields).toEqual(parsed.customFields);
  });

  it("caps starter contact settings to one status and one custom field", () => {
    const parsed = parseContactSettingsJson(JSON.stringify({
      statuses: [
        { key: "prospect", label: "Prospect", color: "blue" },
        { key: "renewal", label: "Renewal", color: "amber" }
      ],
      customFields: [
        { id: "1", key: "plan", label: "Plan", type: "dropdown", options: ["Free", "Pro"], prefix: null },
        { id: "2", key: "mrr", label: "MRR", type: "number", options: [], prefix: "$" }
      ]
    }), "starter");

    expect(parsed.statuses).toEqual([{ key: "prospect", label: "Prospect", color: "blue" }]);
    expect(parsed.customFields).toEqual([
      { id: "1", key: "plan", label: "Plan", type: "dropdown", options: ["Free", "Pro"], prefix: null }
    ]);
  });

  it("strips the legacy seeded status set", () => {
    const parsed = parseContactSettingsJson(JSON.stringify({
      statuses: [
        { key: "lead", label: "Lead", color: "blue" },
        { key: "trial", label: "Trial", color: "purple" },
        { key: "customer", label: "Customer", color: "green" },
        { key: "vip", label: "VIP", color: "amber" },
        { key: "churned", label: "Churned", color: "gray" }
      ]
    }), "growth");

    expect(parsed.statuses).toEqual([]);
  });
});
