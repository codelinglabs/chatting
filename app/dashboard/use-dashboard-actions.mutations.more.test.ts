const mocks = vi.hoisted(() => ({ postDashboardForm: vi.fn() }));

vi.mock("./dashboard-client.api", () => ({ postDashboardForm: mocks.postDashboardForm }));

import {
  createConversationSummary,
  createConversationThread,
  createDashboardActionsHarness
} from "./use-dashboard-actions.test-helpers";
import { createDashboardMutationActions } from "./use-dashboard-actions.mutations";

class MockFormData {
  private readonly values = new Map<string, Array<string | File>>();

  constructor(form?: { __formDataEntries?: Array<[string, string | File]> }) {
    for (const [name, value] of form?.__formDataEntries ?? []) this.append(name, value);
  }

  append(name: string, value: string | File) {
    this.values.set(name, [...(this.values.get(name) ?? []), value]);
  }

  set(name: string, value: string | File) {
    this.values.set(name, [value]);
  }
}

const originalFormData = globalThis.FormData;

function formEvent(entries: Array<[string, string | File]>) {
  return { preventDefault: vi.fn(), currentTarget: { __formDataEntries: entries } } as never;
}

describe("dashboard actions mutations more", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps widget title and visitor email failures", async () => {
    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Widget title failed."));
    const harness = createDashboardActionsHarness();
    await harness.actions.handleSiteTitleSave(formEvent([["widgetTitle", "Fresh"]]), "site_1");
    expect(harness.bannerState.current).toEqual({ tone: "error", text: "Widget title failed." });
    expect(harness.savingSiteIdState.current).toBeNull();

    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Email save failed."));
    await harness.actions.handleSaveConversationEmail(formEvent([["email", "new@example.com"]]));
    expect(harness.bannerState.current).toEqual({ tone: "error", text: "Email save failed." });
    expect(harness.savingEmailState.current).toBe(false);
  });

  it("handles no-op metadata actions when there is no active conversation", async () => {
    const setConversations = vi.fn();
    const mutationActions = createDashboardMutationActions({
      activeConversation: null,
      conversations: [createConversationSummary()],
      setSites: vi.fn(),
      setConversations,
      setActiveConversation: vi.fn(),
      setSavingSiteId: vi.fn(),
      setSavingEmail: vi.fn(),
      setUpdatingStatus: vi.fn(),
      setBanner: vi.fn(),
      pendingTagMutationsRef: { current: new Set<string>() },
      recentOptimisticReplyAtRef: { current: new Map<string, number>() },
      activeTypingConversationIdRef: { current: null },
      lastTypingSentAtRef: { current: 0 },
      setSendingReply: vi.fn(),
      setAnsweredConversations: vi.fn(),
      showBanner: vi.fn(),
      clearTypingSignal: vi.fn(),
      postTypingSignal: vi.fn()
    });
    await mutationActions.handleSaveConversationEmail(formEvent([["email", "new@example.com"]]));
    await mutationActions.handleConversationStatusChange("resolved");
    await mutationActions.handleTagToggle("bug");

    expect(mocks.postDashboardForm).not.toHaveBeenCalled();
    expect(setConversations).not.toHaveBeenCalled();
  });

  it("reopens threads and skips duplicate tag mutations", async () => {
    mocks.postDashboardForm
      .mockResolvedValueOnce({ conversationId: "conv_1", status: "open" })
      .mockResolvedValueOnce({ conversationId: "conv_1", tag: "bug" });
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ status: "resolved", unreadCount: 0, tags: ["pricing"] }),
      conversations: [createConversationSummary({ status: "resolved", unreadCount: 0, tags: ["pricing"] })]
    });

    await harness.actions.handleConversationStatusChange("open");
    expect(harness.bannerState.current).toEqual({ tone: "success", text: "Thread reopened." });
    expect(harness.activeConversationState.current?.status).toBe("open");

    harness.pendingTagMutationsRef.current.add("bug");
    await harness.actions.handleTagToggle("bug");
    expect(mocks.postDashboardForm).toHaveBeenCalledTimes(1);

    harness.pendingTagMutationsRef.current.clear();
    await harness.actions.handleTagToggle("bug");
    expect(harness.activeConversationState.current?.tags).toEqual(["bug", "pricing"]);
    expect(harness.pendingTagMutationsRef.current.size).toBe(0);
  });
});
