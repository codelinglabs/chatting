import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "../dashboard/test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

async function flushAsyncWork() {
  for (let index = 0; index < 6; index += 1) await Promise.resolve();
}

async function loadNewsletterSignupForm() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const showToast = vi.fn();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./toast-provider", () => ({ useToast: () => ({ showToast }) }));
  const module = await import("./newsletter-signup-form");
  return { NewsletterSignupForm: module.NewsletterSignupForm, reactMocks, showToast };
}

describe("newsletter signup form actions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("rejects invalid emails before submitting", async () => {
    const { NewsletterSignupForm, reactMocks, showToast } = await loadNewsletterSignupForm();
    reactMocks.beginRender();
    let tree = NewsletterSignupForm({ source: "blog-card" });
    collectElements(tree, (element) => typeof element.type === "function" && element.props["aria-label"] === "Email address")[0]?.props.onChange({
      target: { value: "bad-email" }
    });
    reactMocks.beginRender();
    tree = NewsletterSignupForm({ source: "blog-card" });
    collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() });

    reactMocks.beginRender();
    tree = NewsletterSignupForm({ source: "blog-card" });
    expect(renderToStaticMarkup(tree)).toContain("Please enter a real email address.");
    expect(showToast).toHaveBeenCalledWith("error", "Enter a valid email address.");
  });

  it("handles successful duplicate signups and failed submissions", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ alreadySubscribed: true }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "newsletter_delivery_failed" }) });
    vi.stubGlobal("fetch", fetchMock);
    const { NewsletterSignupForm, reactMocks, showToast } = await loadNewsletterSignupForm();

    reactMocks.beginRender();
    let tree = NewsletterSignupForm({ source: "blog-card", dark: true });
    const emailField = collectElements(
      tree,
      (element) => typeof element.type === "function" && element.props["aria-label"] === "Email address"
    )[0];
    emailField?.props.onChange({ target: { value: "Team@Example.com" } });
    reactMocks.beginRender();
    tree = NewsletterSignupForm({ source: "blog-card", dark: true });
    collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() });
    await flushAsyncWork();

    reactMocks.beginRender();
    tree = NewsletterSignupForm({ source: "blog-card", dark: true });
    expect(renderToStaticMarkup(tree)).toContain("You&#x27;re already on the list.");

    collectElements(
      tree,
      (element) => typeof element.type === "function" && element.props["aria-label"] === "Email address"
    )[0]?.props.onChange({ target: { value: "hello@example.com" } });
    reactMocks.beginRender();
    tree = NewsletterSignupForm({ source: "blog-card", dark: true });
    collectElements(tree, (element) => element.type === "form")[0]?.props.onSubmit({ preventDefault: vi.fn() });
    await flushAsyncWork();

    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toEqual({ email: "team@example.com", source: "blog-card" });
    expect(showToast).toHaveBeenCalledWith("success", "You're already subscribed.", "We'll keep sending new Chatting articles to this inbox.");
    expect(showToast).toHaveBeenCalledWith(
      "error",
      "We couldn't save your signup.",
      "Your email was valid, but the confirmation delivery failed. Please try again."
    );
  });
});
