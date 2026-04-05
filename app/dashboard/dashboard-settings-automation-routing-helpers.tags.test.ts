import {
  getRoutingTagActionOptions,
  getRoutingVisitorTagOptions
} from "./dashboard-settings-automation-routing-helpers";

describe("dashboard automation routing tag suggestions", () => {
  it("merges workspace tags with the guide's auto-tag suggestions", () => {
    const options = getRoutingTagActionOptions(["custom-tag", "sales-lead"]);

    expect(options).toContain("custom-tag");
    expect(options).toContain("sales-lead");
    expect(options).toContain("feature-request");
    expect(options).toContain("campaign-launch");
  });

  it("keeps common visitor-tag examples available for visitor tag conditions", () => {
    const options = getRoutingVisitorTagOptions(["customer"]);

    expect(options).toEqual(expect.arrayContaining(["customer", "vip", "enterprise", "trial", "client"]));
  });
});
