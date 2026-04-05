const mocks = vi.hoisted(() => ({
  postDashboardForm: vi.fn()
}));
vi.mock("./dashboard-client.api", () => ({
  postDashboardForm: mocks.postDashboardForm
}));
import {
  createConversationSummary,
  createConversationThread,
  createDashboardActionsHarness
} from "./use-dashboard-actions.test-helpers";
import { createDashboardReplyActions } from "./use-dashboard-actions.reply";

class MockFormData {
  private readonly values = new Map<string, Array<string | File>>();

  constructor(form?: { __formDataEntries?: Array<[string, string | File]> }) {
    for (const [name, value] of form?.__formDataEntries ?? []) {
      this.append(name, value);
    }
  }

  append(name: string, value: string | File) {
    this.values.set(name, [...(this.values.get(name) ?? []), value]);
  }

  get(name: string) {
    return this.values.get(name)?.[0] ?? null;
  }

  getAll(name: string) {
    return this.values.get(name) ?? [];
  }

  set(name: string, value: string | File) {
    this.values.set(name, [value]);
  }
}

const originalFormData = globalThis.FormData;
const originalWindow = globalThis.window;
function createReplyEvent(content: string, attachments: File[] = []) {
  return {
    preventDefault: vi.fn(),
    currentTarget: {
      __formDataEntries: [["content", content], ...attachments.map((file) => ["attachments", file] as [string, File])],
      reset: vi.fn()
    }
  } as never;
}

describe("dashboard actions messaging handlers", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        setTimeout: (callback: () => void) => {
          callback();
          return 0;
        },
        URL: {
          createObjectURL: vi.fn(() => "blob:optimistic"),
          revokeObjectURL: vi.fn()
        }
      }
    });
  });
  afterAll(() => {
    globalThis.FormData = originalFormData;
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  });
  it("posts replies optimistically and settles the thread on success", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "team",
        content: "Happy to help",
        createdAt: "2026-03-29T11:00:00.000Z",
        attachments: []
      },
      emailDelivery: "sent"
    });
    const harness = createDashboardActionsHarness({
      conversations: [
        createConversationSummary({ id: "conv_2", updatedAt: "2026-03-29T09:00:00.000Z" }),
        createConversationSummary({ id: "conv_1", unreadCount: 2 })
      ]
    });
    const event = createReplyEvent("Happy to help");
    await harness.actions.handleReplySend(event);
    expect(harness.clearTypingSignal).toHaveBeenCalled();
    expect(event.currentTarget.reset).toHaveBeenCalled();
    expect(harness.activeConversationState.current?.lastMessagePreview).toBe("Happy to help");
    expect(harness.activeConversationState.current?.messages).toHaveLength(2);
    expect(harness.activeConversationState.current?.messages[1]?.pending).toBe(false);
    expect(harness.conversationsState.current[0]?.id).toBe("conv_1");
    expect(harness.recentOptimisticReplyAtRef.current.has("conv_1")).toBe(true);
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Reply posted to the chat thread and emailed to the visitor."
    });
    expect(harness.sendingReplyState.current).toBe(false);
  });

  it("keeps failed optimistic replies in the thread when posting fails", async () => {
    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Reply could not be sent."));
    const harness = createDashboardActionsHarness();
    await harness.actions.handleReplySend(createReplyEvent("Still there?"));
    expect(harness.activeConversationState.current?.messages).toHaveLength(2);
    expect(harness.activeConversationState.current?.messages[1]).toMatchObject({
      content: "Still there?",
      failed: true,
      pending: false
    });
    expect(harness.activeConversationState.current?.lastMessagePreview).toBe("Need help with pricing");
    expect(harness.bannerState.current).toEqual({
      tone: "error",
      text: "Reply could not be sent."
    });
    expect(harness.sendingReplyState.current).toBe(false);
  });

  it("retries failed replies and clears the failed state after a successful resend", async () => {
    const file = new File(["hello"], "retry.txt", { type: "text/plain" });
    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Reply could not be sent."));
    const harness = createDashboardActionsHarness();

    await harness.actions.handleReplySend(createReplyEvent("Retry me", [file]));

    const failedMessage = harness.activeConversationState.current?.messages[1];
    expect(failedMessage).toMatchObject({ failed: true, retryFiles: [file] });

    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "team",
        content: "Retry me",
        createdAt: "2026-03-29T11:30:00.000Z",
        attachments: []
      },
      emailDelivery: "sent"
    });

    const retryActions = createDashboardReplyActions({
      activeConversation: harness.activeConversationState.current,
      setConversations: harness.conversationsState.set,
      setActiveConversation: harness.activeConversationState.set,
      setSendingReply: harness.sendingReplyState.set,
      setAnsweredConversations: harness.answeredConversationsState.set,
      setBanner: harness.bannerState.set,
      recentOptimisticReplyAtRef: harness.recentOptimisticReplyAtRef,
      showBanner: harness.showBanner,
      clearTypingSignal: harness.clearTypingSignal
    } as never);

    await retryActions.handleReplyRetry(failedMessage?.id ?? "");

    expect(harness.activeConversationState.current?.messages[1]).toMatchObject({
      id: "msg_2",
      content: "Retry me",
      pending: false
    });
    expect(globalThis.window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:optimistic");
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Reply posted to the chat thread and emailed to the visitor."
    });
  });

  it("sends typing signals only when needed and clears them on blur", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1000);
    const harness = createDashboardActionsHarness();

    harness.actions.handleReplyComposerInput("Hello");
    harness.actions.handleReplyComposerInput("Hello again");
    harness.actions.handleReplyComposerInput("   ");
    harness.actions.handleReplyComposerFocus("Hello again");
    harness.actions.handleReplyComposerBlur();

    expect(harness.postTypingSignal).toHaveBeenCalledTimes(1);
    expect(harness.postTypingSignal).toHaveBeenCalledWith("conv_1", true);
    expect(harness.clearTypingSignal).toHaveBeenCalledTimes(2);
    nowSpy.mockRestore();
  });

  it("keeps typing signals active while a reply is already sending", () => {
    const harness = createDashboardActionsHarness({ sendingReply: true });

    harness.actions.handleReplyComposerInput("Drafting the next reply");

    expect(harness.postTypingSignal).toHaveBeenCalledWith("conv_1", true);
  });
});
