import { formatResponseTime } from "./format-response-time";

describe("formatResponseTime", () => {
  it("formats compact response times across larger thresholds", () => {
    expect(formatResponseTime(null)).toBe("—");
    expect(formatResponseTime(null, { emptyLabel: "--" })).toBe("--");
    expect(formatResponseTime(45)).toBe("45s");
    expect(formatResponseTime(72)).toBe("1m 12s");
    expect(formatResponseTime(900)).toBe("15m");
    expect(formatResponseTime(3700)).toBe("1h 1m");
    expect(formatResponseTime(113820)).toBe("1d 7h");
  });
});
