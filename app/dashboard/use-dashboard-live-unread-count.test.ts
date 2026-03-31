import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function flushAsyncWork() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
  }
}

describe("useDashboardLiveUnreadCount", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("refreshes unread totals for incoming messages, read events, and connection errors", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    vi.doMock("react", () => reactMocks.moduleFactory());

    const sources: Array<Record<string, unknown>> = [];
    vi.stubGlobal(
      "EventSource",
      class {
        onmessage?: (event: { data: string }) => void;
        onerror?: () => void;
        close = vi.fn();

        constructor(public url: string) {
          sources.push(this as unknown as Record<string, unknown>);
        }
      } as unknown as typeof EventSource
    );

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          ok: true,
          conversations: [{ unreadCount: 2 }, { unreadCount: 3 }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          ok: true,
          conversations: [{ unreadCount: 0 }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          ok: true,
          conversations: [{ unreadCount: 1 }, { unreadCount: 1 }]
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    const module = await import("./use-dashboard-live-unread-count");

    reactMocks.beginRender();
    module.useDashboardLiveUnreadCount(1);
    const cleanups = await runMockEffects(reactMocks.effects);
    const eventSource = sources[0] as {
      onmessage: (event: { data: string }) => void;
      onerror: () => void;
      close: ReturnType<typeof vi.fn>;
    };

    eventSource.onmessage({ data: "not-json" });
    eventSource.onmessage({ data: JSON.stringify({ type: "connected" }) });
    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "founder", conversationId: "conv_1" }) });
    expect(fetchMock).not.toHaveBeenCalled();

    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "user", conversationId: "conv_1" }) });
    await flushAsyncWork();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(reactMocks.states[0]?.current).toBe(5);

    eventSource.onmessage({ data: JSON.stringify({ type: "conversation.read", conversationId: "conv_1" }) });
    await flushAsyncWork();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(reactMocks.states[0]?.current).toBe(0);

    eventSource.onerror();
    await flushAsyncWork();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(reactMocks.states[0]?.current).toBe(2);

    cleanups[0]?.();
    expect(eventSource.close).toHaveBeenCalled();
  });
});
