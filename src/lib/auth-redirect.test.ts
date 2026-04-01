import { buildLoginPath, sanitizeReturnPath } from "./auth-redirect";

describe("auth redirect helpers", () => {
  it("keeps safe internal paths and query strings", () => {
    expect(sanitizeReturnPath("/dashboard/inbox?id=conv_1")).toBe("/dashboard/inbox?id=conv_1");
    expect(sanitizeReturnPath("/feedback?conversationId=conv_1&rating=5")).toBe(
      "/feedback?conversationId=conv_1&rating=5"
    );
  });

  it("rejects external and disallowed targets", () => {
    expect(sanitizeReturnPath("https://evil.example/phish")).toBeNull();
    expect(sanitizeReturnPath("//evil.example/phish")).toBeNull();
    expect(sanitizeReturnPath("/login?redirectTo=%2Fdashboard")).toBeNull();
    expect(sanitizeReturnPath("/api/private")).toBeNull();
    expect(sanitizeReturnPath("/_next/static/chunk.js")).toBeNull();
  });

  it("builds login urls with only safe saved paths", () => {
    expect(buildLoginPath("/feedback?conversationId=conv_1&rating=5")).toBe(
      "/login?redirectTo=%2Ffeedback%3FconversationId%3Dconv_1%26rating%3D5"
    );
    expect(buildLoginPath("https://evil.example/phish")).toBe("/login");
  });
});
