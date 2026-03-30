import { postDashboardForm } from "./dashboard-client.api";

describe("dashboard client api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed payload on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, conversationId: "conv_1" })
    }));

    await expect(postDashboardForm("/dashboard/reply", new FormData())).resolves.toEqual({
      ok: true,
      conversationId: "conv_1"
    });
  });

  it("maps API errors to friendly messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "attachment-too-large" })
    }));

    await expect(postDashboardForm("/dashboard/reply", new FormData())).rejects.toThrow(
      "Each attachment must be smaller than 4 MB."
    );
  });
});
