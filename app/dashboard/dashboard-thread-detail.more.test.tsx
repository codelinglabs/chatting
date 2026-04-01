import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createConversationSummary, createConversationThread } from "./use-dashboard-actions.test-helpers";

vi.mock("./dashboard-thread-detail-sidebar", () => ({
  DashboardThreadDetailSidebar: ({ activeConversation }: { activeConversation: { id: string } }) => (
    <div>sidebar:{activeConversation.id}</div>
  )
}));

import { DashboardThreadDetail } from "./dashboard-thread-detail";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

function baseProps() {
  return {
    loadingConversationSummary: null,
    savingEmail: false,
    sendingReply: false,
    updatingStatus: false,
    isVisitorTyping: false,
    isLiveDisconnected: false,
    teamName: "Chatting",
    teamInitials: "CH",
    onSaveConversationEmail: vi.fn(),
    onSendReply: vi.fn(),
    onRetryReply: vi.fn(),
    onConversationStatusChange: vi.fn().mockResolvedValue(undefined),
    onReplyComposerBlur: vi.fn(),
    onReplyComposerFocus: vi.fn(),
    onReplyComposerInput: vi.fn(),
    onToggleTag: vi.fn().mockResolvedValue(undefined),
    onBack: vi.fn(),
    onOpenSidebar: vi.fn(),
    onCloseSidebar: vi.fn()
  };
}

describe("dashboard thread detail more", () => {
  it("renders anonymous loading and active conversation branches", () => {
    const loadingHtml = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={null}
        loadingConversationSummary={createConversationSummary({ email: null })}
        showSidebarInline={false}
      />
    );
    const activeHtml = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={createConversationThread({
          email: null,
          status: "open",
          messages: [
            {
              id: "msg_1",
              conversationId: "conv_1",
              sender: "founder",
              content: "Pending reply",
              createdAt: "2026-03-29T11:15:00.000Z",
              attachments: [],
              pending: true
            }
          ]
        })}
      />
    );

    expect(loadingHtml).toContain("Visitor");
    expect(loadingHtml).toContain("Anonymous visitor");
    expect(activeHtml).toContain("Resolve");
    expect(activeHtml).toContain("sidebar:conv_1");
    expect(activeHtml).toContain("Chatting ·");
    expect(activeHtml).not.toContain("Sending...");
  });

  it("renders inline retry affordances for failed founder replies", () => {
    const html = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={createConversationThread({
          messages: [
            {
              id: "msg_1",
              conversationId: "conv_1",
              sender: "founder",
              content: "Need another shot",
              createdAt: "2026-03-29T11:15:00.000Z",
              attachments: [],
              failed: true
            }
          ]
        })}
      />
    );

    expect(html).toContain("Didn&#x27;t send");
    expect(html).toContain("Retry");
  });

  it("wires drawer close handlers and ignores shift-enter submits", () => {
    const props = baseProps();
    const tree = DashboardThreadDetail({
      ...props,
      activeConversation: createConversationThread({ status: "open" }),
      showSidebarInline: false,
      showSidebarDrawer: true
    });
    const buttons = collect(tree, (element) => element.type === "button");
    const textarea = collect(tree, (element) => element.type === "textarea")[0];
    const overlay = collect(tree, (element) => element.type === "div" && element.props.onClick)[0];
    const requestSubmit = vi.fn();
    const preventDefault = vi.fn();

    buttons[0]?.props.onClick();
    overlay?.props.onClick();
    buttons.at(-1)?.props.onClick();
    textarea?.props.onKeyDown({
      key: "Enter",
      shiftKey: true,
      preventDefault,
      currentTarget: { form: { requestSubmit } }
    });

    expect(props.onConversationStatusChange).toHaveBeenCalledWith("resolved");
    expect(props.onCloseSidebar).toHaveBeenCalledTimes(2);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("keeps the composer editable while a reply is sending", () => {
    const tree = DashboardThreadDetail({
      ...baseProps(),
      sendingReply: true,
      activeConversation: createConversationThread({ status: "open" }),
      showSidebarInline: false
    });
    const textarea = collect(tree, (element) => element.type === "textarea")[0];
    const buttons = collect(tree, (element) => element.type === "button");

    expect(textarea?.props.disabled).toBeUndefined();
    expect(buttons.at(-1)?.props.disabled).toBe(true);
  });
});
