import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_INTEGRATIONS_STATE } from "./dashboard-integrations-types";
import { createConversationThread } from "./use-dashboard-actions.test-helpers";

const integrationsHookMock = vi.fn(() => ({
  state: DEFAULT_INTEGRATIONS_STATE,
  hydrated: true
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: vi.fn((initialValue: unknown) => [initialValue, vi.fn()])
  };
});

vi.mock("./dashboard-visitor-note-editor", () => ({
  DashboardVisitorNoteEditor: ({ conversationId }: { conversationId: string }) => (
    <div>notes:{conversationId}</div>
  )
}));
vi.mock("./dashboard-thread-detail-shopify-panel", () => ({
  ThreadShopifyCustomerPanel: ({ conversationId }: { conversationId: string }) => (
    <section>shopify:{conversationId}</section>
  )
}));
vi.mock("./dashboard-thread-detail-sidebar-sections", () => ({
  ThreadSidebarIdentity: ({
    visitor,
    conversationId,
    hasEmail,
    savingEmail,
    onSaveConversationEmail
  }: {
    visitor: { name: string; secondary: string };
    conversationId: string;
    hasEmail: boolean;
    savingEmail: boolean;
    onSaveConversationEmail: (event: { preventDefault: () => void }) => Promise<void>;
  }) => (
    <section>
      <div>{visitor.name}</div>
      <div>{visitor.secondary}</div>
      {!hasEmail ? (
        <form onSubmit={onSaveConversationEmail}>
          <input type="hidden" name="conversationId" value={conversationId} />
          <button type="submit">{savingEmail ? "Saving..." : "Save visitor email"}</button>
        </form>
      ) : null}
    </section>
  ),
  ThreadConversationTagsSection: ({
    tags,
    availableTags,
    onToggleTag
  }: {
    tags: string[];
    availableTags: string[];
    onToggleTag: (tag: string) => Promise<void>;
  }) => (
    <section>
      {tags.map((tag) => (
        <button key={tag} type="button" onClick={() => onToggleTag(tag)}>
          {tag}
        </button>
      ))}
      {availableTags.map((tag) => (
        <button key={tag} type="button" onClick={() => onToggleTag(tag)}>
          {`+ ${tag}`}
        </button>
      ))}
    </section>
  ),
  ThreadSharedVisitorNotesSection: ({ conversationId }: { conversationId: string }) => (
    <section>
      <div>Shared visitor notes</div>
      <div>notes:{conversationId}</div>
    </section>
  ),
  ThreadRecentHistorySection: ({
    visitorActivity
  }: {
    visitorActivity: { otherQuestionsLastMonth?: number | null } | null;
  }) =>
    visitorActivity?.otherQuestionsLastMonth ? (
      <section>
        <div>{`This visitor asked ${visitorActivity.otherQuestionsLastMonth} other questions last month.`}</div>
      </section>
    ) : null,
  ThreadContactNoteModalSection: () => null
}));
vi.mock("./use-dashboard-thread-contact", () => ({
  useDashboardThreadContact: () => ({
    contact: null,
    contactStatuses: [],
    saveContactPatch: vi.fn()
  })
}));
vi.mock("./use-dashboard-integrations-state", () => ({
  useDashboardIntegrationsState: () => integrationsHookMock()
}));

import { DashboardThreadDetailSidebar } from "./dashboard-thread-detail-sidebar";

type TestElement = ReactElement<Record<string, unknown>>;

function collectElements(node: ReactNode, predicate: (element: TestElement) => boolean): TestElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as TestElement;
  return [
    ...(predicate(element) ? [element] : []),
    ...collectElements(element.props.children as ReactNode, predicate)
  ];
}

describe("dashboard thread detail sidebar", () => {
  beforeEach(() => {
    integrationsHookMock.mockReset();
    integrationsHookMock.mockReturnValue({ state: DEFAULT_INTEGRATIONS_STATE, hydrated: true });
  });

  it("renders the saved-email visitor profile, tags, notes, and history", () => {
    const html = renderToStaticMarkup(
      <DashboardThreadDetailSidebar
        activeConversation={createConversationThread({
          email: "alex.stone@example.com",
          pageUrl: "https://usechatting.com/",
          recordedPageUrl: "https://usechatting.com/campaigns/80dfca69-4637-42e0-9171-b6ec33868ab8",
          userAgent: "Mozilla/5.0 (Mac OS X) Chrome/123.0",
          visitorActivity: {
            matchType: "email",
            otherQuestionsLastMonth: 2,
            otherConversationsLastMonth: 1,
            otherConversationsTotal: 3,
            lastSeenAt: "2026-03-28T10:00:00.000Z"
          }
        })}
        savingEmail={false}
        assigningConversation={false}
        aiAssistSettings={{
          replySuggestionsEnabled: true,
          conversationSummariesEnabled: true,
          rewriteAssistanceEnabled: true,
          suggestedTagsEnabled: true
        }}
        teamMembers={[]}
        onSaveConversationEmail={vi.fn()}
        onConversationAssignmentChange={vi.fn()}
        onToggleTag={vi.fn()}
      />
    );
    expect(html).toContain("Alex Stone");
    expect(html).toContain("Contact profile");
    expect(html).toContain("Current session");
    expect(html).toContain("Chrome on macOS");
    expect(html).toContain("Record");
    expect(html).toContain("Shared visitor notes");
    expect(html).toContain("notes:conv_1");
    expect(html).toContain("https://usechatting.com/campaigns/80dfca69-4637-42e0-9171-b6ec33868ab8");
    expect(html).toContain("This visitor asked 2 other questions last month.");
    expect(html).not.toContain("Assignment");
  });

  it("shows the email capture form and forwards tag toggles", () => {
    const onSaveConversationEmail = vi.fn();
    const onToggleTag = vi.fn();
    const tree = DashboardThreadDetailSidebar({
      activeConversation: createConversationThread({ email: null }),
      savingEmail: true,
      assigningConversation: false,
      aiAssistSettings: {
        replySuggestionsEnabled: true,
        conversationSummariesEnabled: true,
        rewriteAssistanceEnabled: true,
        suggestedTagsEnabled: true
      },
      teamMembers: [],
      onSaveConversationEmail,
      onConversationAssignmentChange: vi.fn(),
      onToggleTag
    });
    const identitySection = collectElements(
      tree,
      (element) => typeof element.type === "function" && element.props.onSaveConversationEmail === onSaveConversationEmail
    );
    const tagSection = collectElements(
      tree,
      (element) => typeof element.type === "function" && element.props.onToggleTag === onToggleTag
    );
    expect(renderToStaticMarkup(tree)).toContain("Saving...");
    expect(renderToStaticMarkup(tree)).toContain("Shared visitor notes");
    void (identitySection[0]?.props.onSaveConversationEmail as ((event: { preventDefault: () => void }) => Promise<void>) | undefined)?.({ preventDefault: vi.fn() });
    void (tagSection[0]?.props.onToggleTag as ((tag: string) => Promise<void>) | undefined)?.("pricing");
    void (tagSection[0]?.props.onToggleTag as ((tag: string) => Promise<void>) | undefined)?.("confusion");

    expect(onSaveConversationEmail).toHaveBeenCalled();
    expect(onToggleTag).toHaveBeenCalledTimes(2);
  });
});
