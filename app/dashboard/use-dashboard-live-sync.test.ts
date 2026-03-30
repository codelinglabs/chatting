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
    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "founder", conversationId: "conv_1" }) });
    recentOptimisticReplyAtRef.current.set("conv_1", Date.now() - 6000);
    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "founder", conversationId: "conv_1" }) });
    eventSource.onmessage({ data: JSON.stringify({ type: "message.created", sender: "user", conversationId: "conv_1" }) });
    await flushAsyncWork();

    eventSource.onerror();
    cleanups[0]?.();

    expect(setLiveConnectionState).toHaveBeenCalledWith("connected");
    expect(setLiveConnectionState).toHaveBeenCalledWith("reconnecting");
    expect(setVisitorTypingConversationId.mock.calls[0]?.[0](null)).toBe("conv_1");
    expect(setVisitorTypingConversationId.mock.calls[1]?.[0]("conv_1")).toBe(null);
    expect(applyReadState).toHaveBeenCalledWith("conv_2");
    expect(refreshConversationList).toHaveBeenCalled();
    expect(refreshConversation).toHaveBeenCalledWith("conv_1");
    expect(markConversationAsRead).toHaveBeenCalledWith("conv_1");
    expect(recentOptimisticReplyAtRef.current.has("conv_1")).toBe(false);
    expect(eventSource.close).toHaveBeenCalled();
  });
});
