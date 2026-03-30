import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

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

async function flushAsyncWork(cycles = 6) {
  for (let index = 0; index < cycles; index += 1) {
    await Promise.resolve();
  }
}

function getTextarea(tree: ReactNode) {
  return collectElements(
    tree,
    (element) =>
      typeof element.type === "function" &&
      "onChange" in (element.props ?? {}) &&
      "rows" in (element.props ?? {})
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

async function loadVisitorNoteEditor() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const showToast = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
    FormTextarea: (props: Record<string, unknown>) => <textarea {...props} />
  }));
  vi.doMock("../ui/toast-provider", () => ({
    useToast: () => ({ showToast })
  }));

  const module = await import("./dashboard-visitor-note-editor");
  return { DashboardVisitorNoteEditor: module.DashboardVisitorNoteEditor, reactMocks, showToast };
}

describe("dashboard visitor note editor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("skips loading when no visitor identity is available", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { DashboardVisitorNoteEditor, reactMocks } = await loadVisitorNoteEditor();

    reactMocks.beginRender();
    DashboardVisitorNoteEditor({});
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    const tree = DashboardVisitorNoteEditor({});

    expect(renderToStaticMarkup(tree)).toContain("Saved and shared across this visitor&#x27;s conversations.");
    expect(getButton(tree)?.props.disabled).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("loads an existing note and saves updates successfully", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, note: "First touchpoint", updatedAt: "2026-03-29T10:00:00.000Z" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, note: "Important pricing objection", updatedAt: "2026-03-29T10:05:00.000Z" })
      });
    vi.stubGlobal("fetch", fetchMock);

    const { DashboardVisitorNoteEditor, reactMocks, showToast } = await loadVisitorNoteEditor();
    reactMocks.beginRender();
    DashboardVisitorNoteEditor({ conversationId: "conv_1" });
    await runMockEffects(reactMocks.effects);
    await flushAsyncWork();
    reactMocks.beginRender();
    let tree = DashboardVisitorNoteEditor({ conversationId: "conv_1" });

    expect(renderToStaticMarkup(tree)).toContain("Updated");
    expect(getTextarea(tree)?.props.value).toBe("First touchpoint");

    getTextarea(tree)?.props.onChange({
      target: { value: "Important pricing objection" }
    });
    reactMocks.beginRender();
    tree = DashboardVisitorNoteEditor({ conversationId: "conv_1" });
    getButton(tree)?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardVisitorNoteEditor({ conversationId: "conv_1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/visitor-note?conversationId=conv_1",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/visitor-note",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) })
    );
    expect(showToast).toHaveBeenCalledWith("success", "Visitor note saved.");
    expect(getTextarea(tree)?.props.value).toBe("Important pricing objection");
  });

  it("shows toast errors when loading or saving notes fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ ok: false, error: "visitor-note-not-found" })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ ok: false, error: "visitor-note-save-failed" })
      });
    vi.stubGlobal("fetch", fetchMock);

    const { DashboardVisitorNoteEditor, reactMocks, showToast } = await loadVisitorNoteEditor();
    reactMocks.beginRender();
    DashboardVisitorNoteEditor({ conversationId: "conv_1" });
    await runMockEffects(reactMocks.effects);
    await flushAsyncWork();
    reactMocks.beginRender();
    let tree = DashboardVisitorNoteEditor({ conversationId: "conv_1" });

    getTextarea(tree)?.props.onChange({
      target: { value: "Needs follow-up" }
    });
    reactMocks.beginRender();
    tree = DashboardVisitorNoteEditor({ conversationId: "conv_1" });
    getButton(tree)?.props.onClick();
    await flushAsyncWork();

    expect(showToast).toHaveBeenCalledWith(
      "error",
      "We couldn't load visitor notes.",
      expect.any(String)
    );
    expect(showToast).toHaveBeenCalledWith(
      "error",
      "We couldn't save the visitor note.",
      expect.any(String)
    );
  });
});
