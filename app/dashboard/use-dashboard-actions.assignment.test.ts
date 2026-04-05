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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

describe("dashboard assignment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the active thread and summary assignee while tracking pending state", async () => {
    const request = deferred<{ conversationId: string; assignedUserId: string | null }>();
    mocks.postDashboardForm.mockReturnValueOnce(request.promise);
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ assignedUserId: null }),
      conversations: [createConversationSummary({ assignedUserId: null })]
    });

    const action = harness.actions.handleConversationAssignmentChange("member_1");

    expect(harness.assigningConversationState.current).toBe(true);
    request.resolve({ conversationId: "conv_1", assignedUserId: "member_1" });
    await action;

    expect(mocks.postDashboardForm).toHaveBeenCalledWith("/dashboard/assignment", expect.any(FormData));
    expect(harness.activeConversationState.current?.assignedUserId).toBe("member_1");
    expect(harness.conversationsState.current[0]?.assignedUserId).toBe("member_1");
    expect(harness.assigningConversationState.current).toBe(false);
  });

  it("no-ops when there is no active conversation", async () => {
    const harness = createDashboardActionsHarness({ activeConversation: null });

    await harness.actions.handleConversationAssignmentChange("member_1");

    expect(mocks.postDashboardForm).not.toHaveBeenCalled();
    expect(harness.assigningConversationState.current).toBe(false);
  });
});
