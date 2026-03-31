const mocks = vi.hoisted(() => ({
  getMiniMaxConfig: vi.fn(),
  normalizeResponseToneContext: vi.fn(() => "Pricing reply"),
  parseResponseToneAnalysis: vi.fn(() => ({ overall_score: 9 }))
}));

vi.mock("@/lib/env.server", () => ({
  getMiniMaxConfig: mocks.getMiniMaxConfig
}));
vi.mock("@/lib/response-tone-checker", () => ({
  normalizeResponseToneContext: mocks.normalizeResponseToneContext,
  parseResponseToneAnalysis: mocks.parseResponseToneAnalysis
}));

import { analyzeResponseToneWithClaude } from "@/lib/response-tone-checker-service";

describe("response tone checker service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMiniMaxConfig.mockReturnValue({
      apiKey: "api-key",
      model: "custom-model",
      baseUrl: "https://api.example.com"
    });
  });

  it("sends the minimax request and strips reasoning tags before parsing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        base_resp: { status_code: 0 },
        choices: [{ message: { content: "<think>draft</think>{\"ok\":true}" } }]
      })
    }));

    const result = await analyzeResponseToneWithClaude({ message: "We can help", context: "support" as never });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.example.com/v1/text/chatcompletion_v2",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer api-key" }) })
    );
    expect(mocks.parseResponseToneAnalysis).toHaveBeenCalledWith("{\"ok\":true}");
    expect(result).toEqual({ overall_score: 9 });
  });

  it("maps provider failures and empty responses", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ base_resp: { status_code: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ base_resp: { status_code: 0 }, choices: [{ message: { content: "" } }] }) }));

    await expect(analyzeResponseToneWithClaude({ message: "Hi", context: "support" as never })).rejects.toThrow("RESPONSE_TONE_PROVIDER_FAILED");
    await expect(analyzeResponseToneWithClaude({ message: "Hi", context: "support" as never })).rejects.toThrow("INVALID_TONE_ANALYSIS_RESPONSE");
  });

  it("maps parser failures to invalid response errors", async () => {
    mocks.parseResponseToneAnalysis.mockImplementationOnce(() => {
      throw new Error("bad json");
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ base_resp: { status_code: 0 }, choices: [{ message: { content: "{\"ok\":true}" } }] })
    }));

    await expect(analyzeResponseToneWithClaude({ message: "Hi", context: "support" as never })).rejects.toThrow("INVALID_TONE_ANALYSIS_RESPONSE");
  });
});
