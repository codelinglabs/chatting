import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
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
    FormButton: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
    FormTextarea: (props: Record<string, unknown>) => <textarea {...props} />
  }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
  const module = await import("./dashboard-visitor-note-editor");
  return { DashboardVisitorNoteEditor: module.DashboardVisitorNoteEditor, reactMocks, showToast };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

describe("dashboard visitor note editor edge cases", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads notes using a session identity and disables saves when nothing changed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, note: "Known visitor", updatedAt: "2026-03-29T10:00:00.000Z" })
    });
    vi.stubGlobal("fetch", fetchMock);
    const { DashboardVisitorNoteEditor, reactMocks } = await loadVisitorNoteEditor();

    reactMocks.beginRender();
    DashboardVisitorNoteEditor({ siteId: "site_1", sessionId: "sess_1" });
    await runMockEffects(reactMocks.effects);
    await flushAsyncWork();
    reactMocks.beginRender();
    const tree = DashboardVisitorNoteEditor({ siteId: "site_1", sessionId: "sess_1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/visitor-note?siteId=site_1&sessionId=sess_1",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
    expect(
      collect(
        tree,
        (element) =>
          typeof element.type === "function" &&
          "disabled" in (element.props ?? {}) &&
          "onClick" in (element.props ?? {})
      )[0]?.props.disabled
    ).toBe(true);
  });

  it("does not toast when the pending load is cancelled before it resolves", async () => {
    const request = deferred<{ ok: false; json: () => Promise<{ ok: false; error: string }> }>();
    vi.stubGlobal("fetch", vi.fn(() => request.promise));
    const { DashboardVisitorNoteEditor, reactMocks, showToast } = await loadVisitorNoteEditor();

    reactMocks.beginRender();
    DashboardVisitorNoteEditor({ conversationId: "conv_1" });
    const cleanups = await runMockEffects(reactMocks.effects);
    cleanups[0]?.();
    request.resolve({
      ok: false,
      json: async () => ({ ok: false, error: "visitor-note-not-found" })
    });
    await flushAsyncWork();

    expect(showToast).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(DashboardVisitorNoteEditor({ conversationId: "conv_1" }))).toContain("animate-pulse");
  });
});
