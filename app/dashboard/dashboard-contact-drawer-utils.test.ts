import { formatAvgSessionLabel } from "./dashboard-contact-drawer-utils";

describe("dashboard contact drawer utils", () => {
  it("formats average session duration with larger time units", () => {
    expect(formatAvgSessionLabel(Number.NaN)).toBe("0s");
    expect(formatAvgSessionLabel(52)).toBe("52s");
    expect(formatAvgSessionLabel(204)).toBe("3m 24s");
    expect(formatAvgSessionLabel(4 * 60 * 60 + 12 * 60)).toBe("4h 12m");
    expect(formatAvgSessionLabel(333412)).toBe("3d 20h");
    expect(formatAvgSessionLabel(40 * 24 * 60 * 60 + 5 * 60 * 60)).toBe("1mo 10d");
  });
});
