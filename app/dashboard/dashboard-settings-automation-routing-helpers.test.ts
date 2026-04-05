import { reorderRoutingItems } from "./dashboard-settings-automation-routing-helpers";

describe("dashboard automation routing helpers", () => {
  it("reorders a dragged rule to the end of the list", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    const next = reorderRoutingItems(items, "a", 3);

    expect(next.map((item) => item.id)).toEqual(["b", "c", "a"]);
  });

  it("reorders a dragged rule to an earlier slot", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    const next = reorderRoutingItems(items, "c", 1);

    expect(next.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });
});
