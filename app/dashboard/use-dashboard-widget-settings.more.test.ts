import { createSite } from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

class MockFormData {
  private readonly values = new Map<string, string[]>();

  append(name: string, value: string | Blob) {
    this.values.set(name, [...(this.values.get(name) ?? []), typeof value === "string" ? value : "[blob]"]);
  }
}

const originalFormData = globalThis.FormData;

async function loadWidgetSettings(options?: { stateOverrides?: Map<number, unknown>; installed?: boolean }) {
  vi.resetModules();
  const reactMocks = createMockReactHooks({ stateOverrides: options?.stateOverrides });
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("@/lib/site-installation", () => ({ isSiteWidgetInstalled: vi.fn(() => options?.installed ?? false) }));
  vi.doMock("@/lib/widget-settings", () => ({
    buildWidgetSettingsPayload: vi.fn((site: { domain: string | null; proactiveChatEnabled?: boolean }) => ({
      domain: site.domain,
      proactiveChatEnabled: site.proactiveChatEnabled ?? false
    }))
  }));
  const module = await import("./use-dashboard-widget-settings");
  return { reactMocks, useDashboardWidgetSettings: module.useDashboardWidgetSettings };
}

describe("use dashboard widget settings more", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps installation verification errors before and after a draft domain is saved", async () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn()
    });

    const { reactMocks, useDashboardWidgetSettings } = await loadWidgetSettings({
      stateOverrides: new Map([
        [0, [createSite({ domain: null })]],
        [1, [createSite({ domain: null })]]
      ])
    });

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite({ domain: null })]);
    await result.verifyInstallation();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite({ domain: null })]);
    expect(result.verificationError).toBe("Save a site URL first so Chatting can verify the install.");

    result.updateActiveSite((site) => ({ ...site, domain: "https://draft.example" }));
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite({ domain: null })]);
    await result.verifyInstallation();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite({ domain: null })]);
    expect(result.verificationError).toBe("Save your site URL first, then check installation.");
  });

  it("captures detected-false and request-failure verification branches", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, detected: false, error: "site-unreachable" }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "installation-check-failed" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn()
    });

    const { reactMocks, useDashboardWidgetSettings } = await loadWidgetSettings({
      stateOverrides: new Map([[3, "installation"]])
    });

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite()]);
    await result.verifyInstallation();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite()]);
    expect(result.verificationError).toBe("We couldn't reach the site URL right now. Double-check the domain and try again.");
    expect(reactMocks.states[12]?.current).toEqual(["site_1"]);

    await result.verifyInstallation();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite()]);
    expect(result.verificationError).toBe("Unable to check installation right now.");
    expect(result.verificationState).toBe("idle");
  });

  it("maps save failures, handles photo success, and swallows clipboard failures", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "proactive_chat_requires_growth" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, site: createSite({ teamPhotoUrl: "https://cdn.example/team.png" }) }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, site: createSite({ teamPhotoUrl: null }) }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("no clipboard")) } });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn()
    });

    const { reactMocks, useDashboardWidgetSettings } = await loadWidgetSettings();
    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite({ proactiveChatEnabled: true } as never), createSite({ id: "site_2" })]);
    await result.saveChanges();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite({ proactiveChatEnabled: true } as never), createSite({ id: "site_2" })]);
    expect(result.saveError).toBe("Proactive chat is available on Growth.");

    await result.uploadTeamPhoto({ name: "team.png", type: "image/png", size: 10 } as File);
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite(), createSite({ id: "site_2" })]);
    expect(result.savedActiveSite?.teamPhotoUrl).toBe("https://cdn.example/team.png");

    await result.removeTeamPhoto();
    result.setActiveSiteId("site_2");
    await result.copySnippet();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite(), createSite({ id: "site_2" })]);
    expect(result.savedActiveSite?.teamPhotoUrl).toBeNull();
    expect(result.activeSiteId).toBe("site_2");
    expect(result.copiedSnippet).toBe(false);
  });
});
