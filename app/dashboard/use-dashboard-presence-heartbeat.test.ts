import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function loadPresenceHeartbeat() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();

  vi.doMock("react", () => reactMocks.moduleFactory());

  const module = await import("./use-dashboard-presence-heartbeat");
  return { reactMocks, useDashboardPresenceHeartbeat: module.useDashboardPresenceHeartbeat };
}

describe("dashboard presence heartbeat", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts immediately when the dashboard is visible and cleans up its timer", async () => {
    const listeners: Record<string, () => void> = {};
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", {
      visibilityState: "visible",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });
    vi.stubGlobal("window", {
      setInterval: vi.fn().mockReturnValue(7),
      clearInterval: vi.fn(),
      addEventListener: vi.fn((name: string, handler: () => void) => {
        listeners[name] = handler;
      }),
      removeEventListener: vi.fn()
    });

    const { reactMocks, useDashboardPresenceHeartbeat } = await loadPresenceHeartbeat();
    reactMocks.beginRender();
    useDashboardPresenceHeartbeat();
    const cleanups = await runMockEffects(reactMocks.effects);

    expect(fetchMock).toHaveBeenCalledWith("/dashboard/presence", { method: "POST", keepalive: true });
    expect((globalThis.window as Window).setInterval).toHaveBeenCalledWith(expect.any(Function), 30000);

    listeners.focus?.();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    cleanups.forEach((cleanup) => cleanup());
    expect((globalThis.window as Window).clearInterval).toHaveBeenCalledWith(7);
  });

  it("waits for visibility before starting and stops again when hidden", async () => {
    const documentListeners: Record<string, () => void> = {};
    let visibilityState = "hidden";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", {
      get visibilityState() {
        return visibilityState;
      },
      addEventListener: vi.fn((name: string, handler: () => void) => {
        documentListeners[name] = handler;
      }),
      removeEventListener: vi.fn()
    });
    vi.stubGlobal("window", {
      setInterval: vi.fn().mockReturnValue(3),
      clearInterval: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });

    const { reactMocks, useDashboardPresenceHeartbeat } = await loadPresenceHeartbeat();
    reactMocks.beginRender();
    useDashboardPresenceHeartbeat();
    await runMockEffects(reactMocks.effects);

    expect(fetchMock).not.toHaveBeenCalled();

    visibilityState = "visible";
    documentListeners.visibilitychange?.();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    visibilityState = "hidden";
    documentListeners.visibilitychange?.();
    expect((globalThis.window as Window).clearInterval).toHaveBeenCalledWith(3);
  });
});
