import { createSite } from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

class MockFormData {
  private readonly values = new Map<string, string[]>();

  append(name: string, value: string | Blob) {
    this.values.set(name, [...(this.values.get(name) ?? []), typeof value === "string" ? value : "[blob]"]);
  }

  get(name: string) {
    return this.values.get(name)?.[0] ?? null;
  }
}

const originalFormData = globalThis.FormData;

async function loadWidgetSettings(options?: {
  installed?: boolean;
  stateOverrides?: Map<number, unknown>;
}) {
  vi.resetModules();
  const reactMocks = createMockReactHooks({ stateOverrides: options?.stateOverrides });
  const buildPayload = vi.fn((site: { widgetTitle: string; domain: string | null }) => ({
    widgetTitle: site.widgetTitle,
    domain: site.domain
  }));
  const installed = vi.fn(() => options?.installed ?? false);

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("@/lib/site-installation", () => ({ isSiteWidgetInstalled: installed }));
  vi.doMock("@/lib/widget-settings", () => ({ buildWidgetSettingsPayload: buildPayload }));

  const module = await import("./use-dashboard-widget-settings");
  return { buildPayload, installed, reactMocks, useDashboardWidgetSettings: module.useDashboardWidgetSettings };
}

describe("use dashboard widget settings", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves widget changes, shows the saved toast timer, and copies install snippets", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, site: createSite({ widgetTitle: "Fresh title" }) })
    });
    const addEventListener = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn()
    });

    const { reactMocks, useDashboardWidgetSettings } = await loadWidgetSettings();

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite()]);
    result.updateActiveSite((site) => ({ ...site, widgetTitle: "Fresh title" }));
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite()]);
    await result.saveChanges();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite()]);
    await runMockEffects(reactMocks.effects);
    await result.copySnippet();

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/sites/update",
      expect.objectContaining({ method: "POST", body: expect.any(MockFormData) })
    );
    expect((fetchMock.mock.calls[0]?.[1] as { body: MockFormData }).body.get("siteId")).toBe("site_1");
    expect(result.savedActiveSite?.widgetTitle).toBe("Fresh title");
    expect(result.saveState).toBe("saved");
    expect((globalThis.window as Window).setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
    expect((globalThis.navigator as Navigator).clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('data-site-id="site_1"')
    );
    expect(reactMocks.states[14]?.current).toBe(true);
    expect(addEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("auto-verifies installation on the installation tab and blocks unload when drafts are dirty", async () => {
    const verifiedSite = createSite({ widgetInstallVerifiedAt: "2026-03-29T12:00:00.000Z" });
    const addEventListener = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, detected: true, site: verifiedSite })
    }));
    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn()
    });

    const { reactMocks, useDashboardWidgetSettings } = await loadWidgetSettings({
      installed: false,
      stateOverrides: new Map([
        [1, [createSite({ widgetTitle: "Draft title" })]],
        [3, "installation"]
      ])
    });

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite()]);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite()]);

    const beforeUnload = addEventListener.mock.calls.find(([eventName]) => eventName === "beforeunload")?.[1];
    const event = { preventDefault: vi.fn(), returnValue: undefined as string | undefined };
    beforeUnload?.(event);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/dashboard/sites/verify-installation",
      expect.objectContaining({ method: "POST" })
    );
    expect(result.savedActiveSite?.widgetInstallVerifiedAt).toBe("2026-03-29T12:00:00.000Z");
    expect(reactMocks.states[12]?.current).toEqual(["site_1"]);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe("");
  });

  it("surfaces save and photo errors and can discard draft changes", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ ok: false, error: "invalid-image-type" })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ ok: false, error: "team-photo-delete-failed" })
      });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn()
    });

    const site = createSite({ domain: null });
    const { reactMocks, useDashboardWidgetSettings } = await loadWidgetSettings();

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([site]);
    await result.saveChanges();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([site]);
    expect(result.saveError).toBe("Site URL is required before you can save widget setup.");
    result.updateActiveSite((current) => ({ ...current, widgetTitle: "Unsaved" }));
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([site]);
    result.discardChanges();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([site]);
    await result.uploadTeamPhoto({ name: "avatar.txt", type: "text/plain", size: 10 } as File);
    await result.removeTeamPhoto();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([site]);

    expect(result.activeSite?.widgetTitle).toBe("Talk to us");
    expect(reactMocks.states[9]?.current).toBe("Unable to remove the team photo right now.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
