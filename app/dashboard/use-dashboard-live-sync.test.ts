import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function flushAsyncWork() {
  for (let index = 0; index < 6; index += 1) await Promise.resolve();
}

describe("useDashboardLiveSync", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("handles typing, presence, read, message, error, and cleanup events", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    vi.doMock("react", () => reactMocks.moduleFactory());

    const sources: Array<Record<string, unknown>> = [];
    vi.stubGlobal(
      "EventSource",
      class {
        onopen?: () => void;
        onmessage?: (event: { data: string }) => void;
        onerror?: () => void;
        close = vi.fn();

        constructor(public url: string) {
          sources.push(this as unknown as Record<string, unknown>);
        }
      } as unknown as typeof EventSource
    );

    const module = await import("./use-dashboard-live-sync");
    const applyReadState = vi.fn();
    const refreshConversationList = vi.fn().mockResolvedValue(undefined);
    const refreshConversationSummary = vi.fn().mockResolvedValue({ id: "conv_2" });
    const refreshConversation = vi.fn().mockResolvedValue({ id: "conv_1" });
    const markConversationAsRead = vi.fn().mockResolvedValue(undefined);
    const setVisitorTypingConversationId = vi.fn();
    const setLiveConnectionState = vi.fn();
    const activeConversationIdRef = { current: "conv_1" };
    const recentOptimisticReplyAtRef = { current: new Map<string, number>() };

    reactMocks.beginRender();
    module.useDashboardLiveSync({
      activeConversationIdRef,
      recentOptimisticReplyAtRef,
      applyReadState,
      refreshConversationList,
      refreshConversationSummary,
      refreshConversation,
      markConversationAsRead,
      setVisitorTypingConversationId,
      setLiveConnectionState
    });
    const cleanups = await runMockEffects(reactMocks.effects);
    const eventSource = sources[0] as {
      onopen: () => void;
      onmessage: (event: { data: string }) => void;
      onerror: () => void;
      close: ReturnType<typeof vi.fn>;
    };

    eventSource.onopen();
    eventSource.onmessage({ data: "not-json" });
    eventSource.onmessage({ data: JSON.stringify({ type: "typing.updated", actor: "visitor", conversationId: "conv_1", typing: true }) });
    eventSource.onmessage({ data: JSON.stringify({ type: "typing.updated", actor: "visitor", conversationId: "conv_1", typing: false }) });
    eventSource.onmessage({ data: JSON.stringify({ type: "visitor.presence.updated", conversationId: "conv_1" }) });
    eventSource.onmessage({ data: JSON.stringify({ type: "conversation.read", conversationId: "conv_2" }) });

    recentOptimisticReplyAtRef.current.set("conv_1", Date.now());
    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "team", conversationId: "conv_1" }) });
    recentOptimisticReplyAtRef.current.set("conv_1", Date.now() - 6000);
    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "team", conversationId: "conv_1" }) });
    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "user", conversationId: "conv_1" }) });
    eventSource.onmessage({ data: JSON.stringify({ type: "conversation.updated", conversationId: "conv_2", status: "open" }) });
    await flushAsyncWork();

    eventSource.onerror();
    cleanups[0]?.();

    expect(setLiveConnectionState).toHaveBeenCalledWith("connected");
    expect(setLiveConnectionState).toHaveBeenCalledWith("reconnecting");
    expect(setVisitorTypingConversationId.mock.calls[0]?.[0](null)).toBe("conv_1");
    expect(setVisitorTypingConversationId.mock.calls[1]?.[0]("conv_1")).toBe(null);
    expect(applyReadState).toHaveBeenCalledWith("conv_2");
    expect(refreshConversationList).toHaveBeenCalledTimes(1);
    expect(refreshConversation).toHaveBeenCalledWith("conv_1");
    expect(refreshConversationSummary).toHaveBeenCalledWith("conv_2");
    expect(markConversationAsRead).toHaveBeenCalledWith("conv_1");
    expect(recentOptimisticReplyAtRef.current.has("conv_1")).toBe(false);
    expect(eventSource.close).toHaveBeenCalled();
  });

  it("refreshes the full active conversation on conversation.updated events", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    const sources: Array<Record<string, unknown>> = [];
    vi.doMock("react", () => reactMocks.moduleFactory());
    vi.stubGlobal(
      "EventSource",
      class {
        onopen?: () => void;
        onmessage?: (event: { data: string }) => void;
        onerror?: () => void;
        close = vi.fn();

        constructor(public url: string) {
          sources.push(this as unknown as Record<string, unknown>);
        }
      } as unknown as typeof EventSource
    );

    const module = await import("./use-dashboard-live-sync");
    const refreshConversationList = vi.fn().mockResolvedValue(undefined);
    const refreshConversationSummary = vi.fn().mockResolvedValue({ id: "conv_2" });
    const refreshConversation = vi.fn().mockResolvedValue({ id: "conv_1" });

    reactMocks.beginRender();
    module.useDashboardLiveSync({
      activeConversationIdRef: { current: "conv_1" },
      recentOptimisticReplyAtRef: { current: new Map() },
      applyReadState: vi.fn(),
      refreshConversationList,
      refreshConversationSummary,
      refreshConversation,
      markConversationAsRead: vi.fn().mockResolvedValue(undefined),
      setVisitorTypingConversationId: vi.fn(),
      setLiveConnectionState: vi.fn()
    });
    await runMockEffects(reactMocks.effects);
    const eventSource = sources[0] as { onmessage: (event: { data: string }) => void };

    eventSource.onmessage({ data: JSON.stringify({ type: "conversation.updated", conversationId: "conv_1" }) });
    await flushAsyncWork();

    expect(refreshConversation).toHaveBeenCalledWith("conv_1");
    expect(refreshConversationSummary).not.toHaveBeenCalled();
    expect(refreshConversationList).not.toHaveBeenCalled();
  });
});
