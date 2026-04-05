import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

function getTextarea(tree: ReactNode) {
  return collectElements(
    tree,
    (element) =>
      typeof element.type === "function" &&
      "onChange" in (element.props ?? {}) &&
      "value" in (element.props ?? {})
  )[0];
}

function getButton(tree: ReactNode) {
  return collectElements(
    tree,
    (element) =>
      typeof element.type === "function" &&
      "onClick" in (element.props ?? {}) &&
      "disabled" in (element.props ?? {})
  )[0];
}

async function flushAsyncWork(cycles = 6) {
  for (let index = 0; index < cycles; index += 1) await Promise.resolve();
}

async function loadVisitorNoteEditor() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const showToast = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>
  }));
  vi.doMock("./dashboard-visitor-note-mention-field", () => ({
    DashboardVisitorNoteMentionField: ({
      value,
      onChange,
      mentionableUsers: _mentionableUsers,
      ...props
    }: {
      value: string;
      onChange: (nextValue: string) => void;
    }) => (
      <textarea
        {...props}
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));

  const module = await import("./dashboard-visitor-note-editor");
  return { DashboardVisitorNoteEditor: module.DashboardVisitorNoteEditor, reactMocks, showToast };
}

describe("dashboard visitor note editor more", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses site and email identity params, shows the skeleton first, and clears notes successfully", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, note: "Pricing lead", updatedAt: "2026-03-29T10:00:00.000Z" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, note: "", updatedAt: null })
      });
    vi.stubGlobal("fetch", fetchMock);

    const { DashboardVisitorNoteEditor, reactMocks, showToast } = await loadVisitorNoteEditor();
    reactMocks.beginRender();
    let tree = DashboardVisitorNoteEditor({ siteId: "site_1", email: "alex@example.com" });
    expect(renderToStaticMarkup(tree)).toContain("animate-pulse");

    await runMockEffects(reactMocks.effects);
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardVisitorNoteEditor({ siteId: "site_1", email: "alex@example.com" });
    getTextarea(tree)?.props.onChange("");
    reactMocks.beginRender();
    tree = DashboardVisitorNoteEditor({ siteId: "site_1", email: "alex@example.com" });
    getButton(tree)?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardVisitorNoteEditor({ siteId: "site_1", email: "alex@example.com" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/visitor-note?siteId=site_1&email=alex%40example.com",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
    expect(showToast).toHaveBeenCalledWith("success", "Visitor note cleared.");
    expect(renderToStaticMarkup(tree)).toContain("Updated");
  });

  it("prefers the conversation identity over site params when both are present", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, note: "Conversation note", updatedAt: "2026-03-29T10:00:00.000Z" })
    });
    vi.stubGlobal("fetch", fetchMock);

    const { DashboardVisitorNoteEditor, reactMocks } = await loadVisitorNoteEditor();
    reactMocks.beginRender();
    DashboardVisitorNoteEditor({
      conversationId: "conv_1",
      siteId: "site_1",
      email: "alex@example.com",
      sessionId: "sess_1"
    });
    await runMockEffects(reactMocks.effects);
    await flushAsyncWork();

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/visitor-note?conversationId=conv_1",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
  });

  it("shows a warning toast after save when a mention needs follow-up", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, note: "First touchpoint", updatedAt: "2026-03-29T10:00:00.000Z" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          note: "@tina please confirm",
          updatedAt: "2026-03-29T10:05:00.000Z",
          sent: [],
          ambiguous: ["tina"],
          unresolved: [],
          disabled: []
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    const { DashboardVisitorNoteEditor, reactMocks, showToast } = await loadVisitorNoteEditor();
    reactMocks.beginRender();
    DashboardVisitorNoteEditor({ conversationId: "conv_1" });
    await runMockEffects(reactMocks.effects);
    await flushAsyncWork();
    reactMocks.beginRender();
    let tree = DashboardVisitorNoteEditor({ conversationId: "conv_1" });

    getTextarea(tree)?.props.onChange("@tina please confirm");
    reactMocks.beginRender();
    tree = DashboardVisitorNoteEditor({ conversationId: "conv_1" });
    getButton(tree)?.props.onClick();
    await flushAsyncWork();

    expect(showToast).toHaveBeenCalledWith("success", "Visitor note saved.");
    expect(showToast).toHaveBeenCalledWith(
      "warning",
      "Some mentions need attention.",
      "Pick a more specific teammate for @tina."
    );
  });
});
