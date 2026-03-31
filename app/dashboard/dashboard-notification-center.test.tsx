import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function loadNotificationCenter(options?: { toast?: Record<string, unknown> | null }) {
  vi.resetModules();
  const eventSources: Array<{ onmessage?: (event: { data: string }) => void; close: ReturnType<typeof vi.fn> }> = [];
  const navigate = vi.fn();
  const reactMocks = createMockReactHooks({
    stateOverrides: new Map([
      [1, options?.toast ?? null]
    ])
  });

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({
    usePathname: () => "/dashboard",
    useSearchParams: () => ({ get: () => null })
  }));
  vi.doMock("./dashboard-shell", () => ({
    useDashboardNavigation: () => ({ navigate })
  }));
  vi.doMock("./dashboard-ui", () => ({
    pageLabelFromUrl: () => "/pricing",
    XIcon: () => <svg />
  }));
  vi.stubGlobal("document", { visibilityState: "hidden" });
  vi.stubGlobal("EventSource", class {
    onmessage?: (event: { data: string }) => void;
    close = vi.fn();
    constructor() {
      eventSources.push(this);
    }
  });

  const notifications: Array<{ title: string; body: string }> = [];
  class MockNotification {
    static permission = "default";
    static requestPermission = vi.fn().mockResolvedValue("granted");
    constructor(title: string, options: { body: string }) {
      notifications.push({ title, body: options.body });
    }
  }
  vi.stubGlobal("Notification", MockNotification as never);
  vi.stubGlobal("window", {
    AudioContext: class {
      currentTime = 0;
      destination = {};
      createOscillator() { return { type: "sine", frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null as null | (() => void) }; }
      createGain() { return { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }; }
      close = vi.fn().mockResolvedValue(undefined);
    },
    Notification: MockNotification,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setTimeout: vi.fn().mockReturnValue(1),
    clearTimeout: vi.fn()
  });

  const module = await import("./dashboard-notification-center");
  return { DashboardNotificationCenter: module.DashboardNotificationCenter, eventSources, navigate, notifications, reactMocks };
}

describe("dashboard notification center", () => {
  it("requests permission and reacts to incoming high-intent visitor messages", async () => {
    const { DashboardNotificationCenter, eventSources, notifications, reactMocks } =
      await loadNotificationCenter();

    reactMocks.beginRender();
    DashboardNotificationCenter({
      initialSettings: {
        browserNotifications: true,
        soundAlerts: true,
        emailNotifications: true,
        newVisitorAlerts: true,
        highIntentAlerts: true
      }
    });
    const cleanups = await runMockEffects(reactMocks.effects);
    (globalThis.Notification as unknown as { permission: string }).permission = "granted";

    eventSources[0]?.onmessage?.({
      data: JSON.stringify({
        type: "message.created",
        sender: "user",
        conversationId: "conv_1",
        preview: "Pricing help",
        pageUrl: "https://example.com/pricing",
        visitorLabel: "Alex",
        location: "London",
        highIntent: true,
        isNewVisitor: true
      })
    });

    expect(reactMocks.states[1]?.current).toEqual({
      conversationId: "conv_1",
      title: "High-intent visitor on /pricing",
      preview: "London • Pricing help"
    });
    expect(notifications).toEqual([{ title: "High-intent visitor on /pricing", body: "London • Pricing help" }]);
    cleanups.at(-1)?.();
    expect(eventSources[0]?.close).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("renders an actionable toast and routes inbox navigation on click", async () => {
    const { DashboardNotificationCenter, navigate, reactMocks } = await loadNotificationCenter({
      toast: { conversationId: "conv_1", title: "Alex", preview: "Pricing help" }
    });

    reactMocks.beginRender();
    const element = DashboardNotificationCenter({
      initialSettings: {
        browserNotifications: false,
        soundAlerts: false,
        emailNotifications: true,
        newVisitorAlerts: false,
        highIntentAlerts: false
      }
    }) as { type: (props: Record<string, unknown>) => { props: Record<string, unknown> }; props: Record<string, unknown> };
    const toast = element.type(element.props);

    expect(toast.props.role).toBe("button");
    (toast.props.onClick as () => void)();
    expect(navigate).toHaveBeenCalledWith("/dashboard/inbox?id=conv_1");
    expect(reactMocks.states[1]?.current).toBeNull();
    vi.unstubAllGlobals();
  });
});
