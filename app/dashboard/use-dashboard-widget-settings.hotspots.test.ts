import { createSite } from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

class MockFormData {
  append() {}
}

const originalFormData = globalThis.FormData;

async function loadHook(options?: { installed?: boolean; stateOverrides?: Map<number, unknown> }) {
  vi.resetModules();
  const reactMocks = createMockReactHooks({ stateOverrides: options?.stateOverrides });
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("@/lib/site-installation", () => ({ isSiteWidgetInstalled: vi.fn(() => options?.installed ?? false) }));
  vi.doMock("@/lib/widget-settings", () => ({ buildWidgetSettingsPayload: vi.fn((site: { domain: string | null }) => ({ domain: site.domain })) }));
  const module = await import("./use-dashboard-widget-settings");
  return { reactMocks, useDashboardWidgetSettings: module.useDashboardWidgetSettings };
}

describe("use dashboard widget settings hotspots", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns early without an active site and leaves clean beforeunload events untouched", async () => {
    const addEventListener = vi.fn();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
    vi.stubGlobal("window", { addEventListener, removeEventListener: vi.fn(), setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn() });
    const { reactMocks, useDashboardWidgetSettings } = await loadHook();

    reactMocks.beginRender();
    const result = useDashboardWidgetSettings([]);
    const cleanups = await runMockEffects(reactMocks.effects);
    await result.saveChanges();
    await result.uploadTeamPhoto({} as File);
    await result.removeTeamPhoto();
    await result.verifyInstallation();
    await result.copySnippet();

    const handler = addEventListener.mock.calls.find(([event]) => event === "beforeunload")?.[1];
    const event = { preventDefault: vi.fn(), returnValue: undefined as string | undefined };
    handler?.(event);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    cleanups.forEach((cleanup) => cleanup());
  });

  it("skips auto verification when already installed or already checked", async () => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn(), setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn() });

    const installed = await loadHook({ installed: true, stateOverrides: new Map([[3, "installation"]]) });
    installed.reactMocks.beginRender();
    installed.useDashboardWidgetSettings([createSite()]);
    await runMockEffects(installed.reactMocks.effects);

    const checked = await loadHook({ stateOverrides: new Map([[3, "installation"], [12, ["site_1"]]]) });
    checked.reactMocks.beginRender();
    checked.useDashboardWidgetSettings([createSite()]);
    await runMockEffects(checked.reactMocks.effects);

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("updates the saved site on detected-false responses and clears the saved-toast timer on cleanup", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, detected: false, error: "site-unreachable", site: createSite({ widgetLastSeenAt: "2026-03-29T12:00:00.000Z" }) })
    }));
    vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn(), setTimeout: vi.fn().mockReturnValue(7), clearTimeout: vi.fn() });
    const { reactMocks, useDashboardWidgetSettings } = await loadHook({ stateOverrides: new Map([[13, true]]) });

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite()]);
    const cleanups = await runMockEffects(reactMocks.effects);
    await result.verifyInstallation();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite()]);

    expect(result.savedActiveSite?.widgetLastSeenAt).toBe("2026-03-29T12:00:00.000Z");
    expect(result.verificationError).toBe("We couldn't reach the site URL right now. Double-check the domain and try again.");
    cleanups[0]?.();
    expect((globalThis.window as Window).clearTimeout).toHaveBeenCalledWith(7);
  });

  it("executes the returned setters and skips auto verification outside the installation-check path", async () => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn(), setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn() });
    const { reactMocks, useDashboardWidgetSettings } = await loadHook({ stateOverrides: new Map([[10, "checking"]]) });

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite(), createSite({ id: "site_2" })]);
    result.setActiveSiteId("site_2");
    result.setActiveTab("installation");
    result.setInstallPlatform("nextjs");
    result.setPreviewDevice("mobile");
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite(), createSite({ id: "site_2" })]);
    await runMockEffects(reactMocks.effects);

    expect(result.activeSiteId).toBe("site_2");
    expect(result.activeTab).toBe("installation");
    expect(result.installPlatform).toBe("nextjs");
    expect(result.previewDevice).toBe("mobile");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("covers payload-missing and non-Error fallback branches across upload, remove, save, and verify", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false }) })
      .mockRejectedValueOnce("boom")
      .mockRejectedValueOnce("boom")
      .mockRejectedValueOnce("boom"));
    vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn(), setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn() });
    const { reactMocks, useDashboardWidgetSettings } = await loadHook();

    reactMocks.beginRender();
    let result = useDashboardWidgetSettings([createSite(), createSite({ id: "site_2" })]);
    await result.uploadTeamPhoto({} as File);
    await result.removeTeamPhoto();
    await result.saveChanges();
    await result.verifyInstallation();
    result.setActiveSiteId("site_2");
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite(), createSite({ id: "site_2" })]);
    result.updateActiveSite((site) => ({ ...site, widgetTitle: "Updated" }));
    result.discardChanges();
    await result.uploadTeamPhoto({} as File);
    await result.saveChanges();
    await result.verifyInstallation();
    reactMocks.beginRender();
    result = useDashboardWidgetSettings([createSite(), createSite({ id: "site_2" })]);

    expect(result.photoError).toBe("Unable to update the team photo right now.");
    expect(result.saveError).toBe("Unable to save widget settings.");
    expect(result.verificationError).toBe("We didn't find the Chatting snippet on the checked page yet.");
  });
});
