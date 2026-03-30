import { verifySiteWidgetSnippet } from "@/lib/site-installation-verifier";

describe("site installation verifier edge cases", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns missing-domain without attempting a fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifySiteWidgetSnippet({ domain: "   ", siteId: "site_123" })).resolves.toEqual({
      ok: false,
      error: "missing-domain"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tries localhost over both protocols and accepts json-style site ids", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        ok: true,
        url: "",
        text: vi.fn().mockResolvedValue('<script src="widget.js">{"siteId":"site_123"}</script>')
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      verifySiteWidgetSnippet({
        domain: "localhost:3000",
        siteId: "site_123"
      })
    ).resolves.toEqual({
      ok: true,
      url: "https://localhost:3000"
    });
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:3000",
      "https://localhost:3000"
    ]);
  });

  it("returns verification-failed when the site loads but the snippet is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        url: "https://example.com",
        text: vi.fn().mockResolvedValue("<html><body>No widget here</body></html>")
      })
    );

    await expect(verifySiteWidgetSnippet({ domain: "https://example.com", siteId: "site_123" })).resolves.toEqual({
      ok: false,
      error: "verification-failed"
    });
  });

  it("returns site-unreachable when every attempt fails or returns a bad response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: false })
        .mockRejectedValueOnce(new Error("network"))
    );

    await expect(verifySiteWidgetSnippet({ domain: "example.com", siteId: "site_123" })).resolves.toEqual({
      ok: false,
      error: "site-unreachable"
    });
  });
});
