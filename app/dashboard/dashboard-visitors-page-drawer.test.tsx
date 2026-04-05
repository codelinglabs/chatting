import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createVisitor } from "./dashboard-visitors-page.test-helpers";

vi.mock("./dashboard-visitor-note-editor", () => ({
  DashboardVisitorNoteEditor: ({ siteId, sessionId }: { siteId: string; sessionId: string }) => (
    <div>notes:{siteId}:{sessionId}</div>
  )
}));

import { VisitorDetailsDrawer } from "./dashboard-visitors-page-drawer";

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

describe("visitor details drawer", () => {
  it("returns null without a selected visitor", () => {
    expect(
      VisitorDetailsDrawer({
        visitor: null,
        onClose: vi.fn(),
        onOpenConversation: vi.fn(),
        onNavigateVisit: vi.fn()
      })
    ).toBeNull();
  });

  it("renders visitor details and forwards drawer actions", () => {
    const onClose = vi.fn();
    const onOpenConversation = vi.fn();
    const onNavigateVisit = vi.fn();
    const tree = VisitorDetailsDrawer({
      visitor: createVisitor(),
      onClose,
      onOpenConversation,
      onNavigateVisit
    });
    const buttons = collectElements(tree, (element) => element.type === "button");

    expect(renderToStaticMarkup(tree)).toContain("Contact profile");
    expect(renderToStaticMarkup(tree)).toContain("Open latest conversation");
    expect(renderToStaticMarkup(tree)).toContain("Shared visitor notes");
    expect(renderToStaticMarkup(tree)).toContain("Timezone");
    expect(renderToStaticMarkup(tree)).toContain("notes:site_1:session_1");

    (tree as ReactElement).props.onClick();
    buttons[0]?.props.onClick();
    buttons[1]?.props.onClick();
    buttons[2]?.props.onClick();

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onNavigateVisit).toHaveBeenCalledWith("conv_1");
    expect(onOpenConversation).toHaveBeenCalled();
  });

  it("shows empty conversation and tag states when a visitor has no history", () => {
    const html = renderToStaticMarkup(
      <VisitorDetailsDrawer
        visitor={createVisitor({
          latestConversationId: null,
          hasConversation: false,
          conversationCount: 0,
          pageHistory: [],
          visitHistory: [],
          tags: []
        })}
        onClose={vi.fn()}
        onOpenConversation={vi.fn()}
        onNavigateVisit={vi.fn()}
      />
    );

    expect(html).toContain("haven&#x27;t started a conversation yet");
    expect(html).toContain("No tags yet.");
    expect(html).toContain("No page history captured yet.");
    expect(html).toContain("No conversation history captured yet.");
  });
});
