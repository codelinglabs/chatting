import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "../dashboard/test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

describe("toast provider", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("adds, caps, dismisses, and auto-clears toasts", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    vi.doMock("react", () => reactMocks.moduleFactory());
    vi.stubGlobal("window", {
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn()
    });

    const module = await import("./toast-provider");
    reactMocks.beginRender();
    let tree = module.ToastProvider({ children: <div>child</div> });
    const showToast = (tree as ReactElement).props.value.showToast as (
      tone: "success" | "error",
      title: string,
      message?: string
    ) => void;

    showToast("success", "One");
    showToast("error", "Two", "Broken");
    showToast("success", "Three");
    showToast("error", "Four");

    reactMocks.beginRender();
    tree = module.ToastProvider({ children: <div>child</div> });
    const html = renderToStaticMarkup(tree);
    expect(html).not.toContain("One");
    expect(html).toContain("Two");
    expect(html).toContain("Three");
    expect(html).toContain("Four");

    await runMockEffects(reactMocks.effects);
    expect(globalThis.window.setTimeout).toHaveBeenCalled();

    collectElements(tree, (element) => element.type === "button" && element.props["aria-label"] === "Dismiss toast")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = module.ToastProvider({ children: <div>child</div> });
    expect(renderToStaticMarkup(tree)).not.toContain("Two");
  });
});
