const mocks = vi.hoisted(() => ({
  postDashboardForm: vi.fn()
}));

vi.mock("./dashboard-client.api", () => ({
  postDashboardForm: mocks.postDashboardForm
}));

import {
  createConversationSummary,
  createConversationThread,
  createDashboardActionsHarness,
  createSite
} from "./use-dashboard-actions.test-helpers";

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

function formEvent(entries: Array<[string, string | File]>) {
  return {
    preventDefault: vi.fn(),
    currentTarget: { __formDataEntries: entries }
  } as never;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("dashboard actions metadata handlers", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
  });

  it("saves the widget title and updates the matching site", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({ siteId: "site_1", widgetTitle: "Fresh title" });
    const harness = createDashboardActionsHarness({
      sites: [createSite({ widgetTitle: "Old title" }), createSite({ id: "site_2", widgetTitle: "Other" })]
    });

    await harness.actions.handleSiteTitleSave(formEvent([["widgetTitle", "Fresh title"]]), "site_1");

    expect(mocks.postDashboardForm).toHaveBeenCalledWith("/dashboard/sites/update", expect.any(MockFormData));
    expect(harness.sitesState.current[0]?.widgetTitle).toBe("Fresh title");
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Widget title saved without leaving the page."
    });
    expect(harness.savingSiteIdState.current).toBeNull();
  });

  it("saves the visitor email in both the active thread and the list summary", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({ conversationId: "conv_1", email: "new@example.com" });
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ email: null }),
      conversations: [createConversationSummary({ email: null })]
    });

    await harness.actions.handleSaveConversationEmail(formEvent([["email", "new@example.com"]]));

    expect(harness.activeConversationState.current?.email).toBe("new@example.com");
    expect(harness.conversationsState.current[0]?.email).toBe("new@example.com");
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Visitor email saved."
    });
    expect(harness.savingEmailState.current).toBe(false);
  });

  it("optimistically updates the conversation status before the request resolves", async () => {
    const request = deferred<{ conversationId: string; status: "resolved" }>();
    mocks.postDashboardForm.mockReturnValueOnce(request.promise);
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ unreadCount: 3 }),
      conversations: [createConversationSummary({ unreadCount: 3 })]
    });

    const action = harness.actions.handleConversationStatusChange("resolved");

    expect(harness.activeConversationState.current?.status).toBe("resolved");
    expect(harness.activeConversationState.current?.unreadCount).toBe(0);
    expect(harness.conversationsState.current[0]?.status).toBe("resolved");
    expect(harness.conversationsState.current[0]?.unreadCount).toBe(0);
    expect(harness.updatingStatusState.current).toBe(true);

    request.resolve({ conversationId: "conv_1", status: "resolved" });
    await action;

    expect(harness.activeConversationState.current?.status).toBe("resolved");
    expect(harness.activeConversationState.current?.unreadCount).toBe(0);
    expect(harness.conversationsState.current[0]?.status).toBe("resolved");
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Thread marked as resolved."
    });
    expect(harness.updatingStatusState.current).toBe(false);
  });

  it("reverts the optimistic conversation status when the mutation fails", async () => {
    const request = deferred<never>();
    mocks.postDashboardForm.mockReturnValueOnce(request.promise);
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ status: "open", unreadCount: 3 }),
      conversations: [createConversationSummary({ status: "open", unreadCount: 1 })]
    });

    const action = harness.actions.handleConversationStatusChange("resolved");

    expect(harness.activeConversationState.current?.status).toBe("resolved");
    expect(harness.activeConversationState.current?.unreadCount).toBe(0);
    expect(harness.conversationsState.current[0]?.status).toBe("resolved");
    expect(harness.conversationsState.current[0]?.unreadCount).toBe(0);

    request.reject(new Error("Status update failed."));
    await action;

    expect(harness.activeConversationState.current?.status).toBe("open");
    expect(harness.activeConversationState.current?.unreadCount).toBe(3);
    expect(harness.conversationsState.current[0]?.status).toBe("open");
    expect(harness.conversationsState.current[0]?.unreadCount).toBe(1);
    expect(harness.bannerState.current).toEqual({
      tone: "error",
      text: "Status update failed."
    });
    expect(harness.updatingStatusState.current).toBe(false);
  });

  it("reverts tag changes when the mutation fails", async () => {
    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Tag update failed."));
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ tags: ["pricing"] }),
      conversations: [createConversationSummary({ tags: ["pricing"] })]
    });

    await harness.actions.handleTagToggle("bug");

    expect(harness.activeConversationState.current?.tags).toEqual(["pricing"]);
    expect(harness.conversationsState.current[0]?.tags).toEqual(["pricing"]);
    expect(harness.bannerState.current).toEqual({
      tone: "error",
      text: "Tag update failed."
    });
    expect(harness.pendingTagMutationsRef.current.size).toBe(0);
  });
});
