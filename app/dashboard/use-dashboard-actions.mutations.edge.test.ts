const mocks = vi.hoisted(() => ({ postDashboardForm: vi.fn() }));

vi.mock("./dashboard-client.api", () => ({ postDashboardForm: mocks.postDashboardForm }));

import {
  createConversationSummary,
  createConversationThread,
  createDashboardActionsHarness
} from "./use-dashboard-actions.test-helpers";

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

describe("dashboard actions mutations edge cases", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses default fallback messages for non-error failures", async () => {
    mocks.postDashboardForm
      .mockRejectedValueOnce("nope")
      .mockRejectedValueOnce("nope")
      .mockRejectedValueOnce("nope")
      .mockRejectedValueOnce("nope");
    const harness = createDashboardActionsHarness({
      conversations: [createConversationSummary({ id: "conv_2" })]
    });

    await harness.actions.handleSiteTitleSave(formEvent([["widgetTitle", "Fresh"]]), "site_1");
    expect(harness.bannerState.current).toEqual({ tone: "error", text: "Widget title could not be saved." });

    await harness.actions.handleSaveConversationEmail(formEvent([["email", "new@example.com"]]));
    expect(harness.bannerState.current).toEqual({ tone: "error", text: "Visitor email could not be saved." });

    await harness.actions.handleConversationStatusChange("resolved");
    expect(harness.bannerState.current).toEqual({ tone: "error", text: "Thread status could not be updated." });
    expect(harness.activeConversationState.current?.status).toBe("open");

    await harness.actions.handleTagToggle("bug");
    expect(harness.bannerState.current).toEqual({ tone: "error", text: "Tag update failed." });
  });

  it("skips duplicate pending tag mutations when an active conversation exists", async () => {
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ tags: ["pricing"] }),
      conversations: [createConversationSummary({ tags: ["pricing"] })]
    });
    harness.pendingTagMutationsRef.current.add("pricing");

    await harness.actions.handleTagToggle("pricing");

    expect(mocks.postDashboardForm).not.toHaveBeenCalled();
    expect(harness.activeConversationState.current?.tags).toEqual(["pricing"]);
  });
});
