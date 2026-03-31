import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createConversationThread } from "./use-dashboard-actions.test-helpers";

vi.mock("./dashboard-visitor-note-editor", () => ({
  DashboardVisitorNoteEditor: ({ conversationId }: { conversationId: string }) => (
    <div>notes:{conversationId}</div>
  )
}));

import { DashboardThreadDetailSidebar } from "./dashboard-thread-detail-sidebar";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as ReactElement;
  return [
    ...(predicate(element) ? [element] : []),
    ...collectElements(element.props?.children, predicate)
  ];
}

function textOf(node: ReactNode): string {
  if (!node || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join(" ");
  }
  return textOf((node as ReactElement).props?.children);
}

describe("dashboard thread detail sidebar", () => {
  it("renders the saved-email visitor profile, tags, notes, and history", () => {
    const html = renderToStaticMarkup(
      <DashboardThreadDetailSidebar
        activeConversation={createConversationThread({
          email: "alex.stone@example.com",
          pageUrl: "https://heypond.app/",
          recordedPageUrl: "https://heypond.app/campaigns/80dfca69-4637-42e0-9171-b6ec33868ab8",
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
        onSaveConversationEmail={vi.fn()}
        onToggleTag={vi.fn()}
      />
    );

    expect(html).toContain("Alex Stone");
    expect(html).toContain("Current session");
    expect(html).toContain("Chrome on macOS");
    expect(html).toContain("notes:conv_1");
    expect(html).toContain("https://heypond.app/campaigns/80dfca69-4637-42e0-9171-b6ec33868ab8");
    expect(html).toContain("This visitor asked 2 other questions last month.");
  });

  it("shows the email capture form and forwards tag toggles", () => {
    const onSaveConversationEmail = vi.fn();
    const onToggleTag = vi.fn();
    const tree = DashboardThreadDetailSidebar({
      activeConversation: createConversationThread({ email: null }),
      savingEmail: true,
      onSaveConversationEmail,
      onToggleTag
    });

    const form = collectElements(tree, (element) => element.type === "form")[0];
    const tagButtons = collectElements(
      tree,
      (element) => element.type === "button" && textOf(element.props.children).includes("pricing")
    );
    const addButtons = collectElements(
      tree,
      (element) => element.type === "button" && textOf(element.props.children).includes("+")
    );

    expect(renderToStaticMarkup(tree)).toContain("Saving...");
    form?.props.onSubmit({ preventDefault: vi.fn() });
    tagButtons[0]?.props.onClick();
    addButtons[0]?.props.onClick();

    expect(onSaveConversationEmail).toHaveBeenCalled();
    expect(onToggleTag).toHaveBeenCalledTimes(2);
  });
});
