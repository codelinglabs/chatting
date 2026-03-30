import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WidgetInstallationPanel } from "./dashboard-widget-settings-installation-panel";
import { createSite } from "./use-dashboard-actions.test-helpers";

function collectButtons(node: ReactNode): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap(collectButtons);
  const element = node as ReactElement;
  return [
    ...(element.type === "button" ? [element] : []),
    ...collectButtons(element.props?.children)
  ];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

describe("widget installation panel edge states", () => {
  it("renders the last-seen installed state and maps each guide branch", () => {
    const onSetInstallPlatform = vi.fn();
    const tree = WidgetInstallationPanel({
      activeSite: createSite({
        widgetLastSeenAt: "2026-03-29T12:00:00.000Z",
        widgetLastSeenUrl: "https://example.com/pricing"
      }),
      installPlatform: "html",
      copiedSnippet: true,
      verificationState: "checking",
      verificationError: "",
      onSetInstallPlatform,
      onCopySnippet: vi.fn(),
      onVerifyInstallation: vi.fn()
    });
    const html = renderToStaticMarkup(tree);
    const buttons = collectButtons(tree);

    buttons.find((button) => textContent(button.props.children).includes("WordPress"))?.props.onClick();
    buttons.find((button) => textContent(button.props.children).includes("Webflow"))?.props.onClick();
    buttons.find((button) => textContent(button.props.children).includes("Squarespace"))?.props.onClick();
    buttons.find((button) => textContent(button.props.children).includes("Wix"))?.props.onClick();

    expect(html).toContain("Widget installed");
    expect(html).toContain("Detected on https://example.com/pricing");
    expect(html).toContain("Copied!");
    expect(html).not.toContain("Check installation");
    expect(onSetInstallPlatform.mock.calls).toEqual([
      ["wordpress"],
      ["webflow"],
      ["html"],
      ["html"]
    ]);
  });

  it("renders the verified-url fallback when the widget was manually confirmed", () => {
    const html = renderToStaticMarkup(
      <WidgetInstallationPanel
        activeSite={createSite({
          conversationCount: 0,
          widgetLastSeenAt: null,
          widgetInstallVerifiedAt: "2026-03-28T12:00:00.000Z",
          widgetInstallVerifiedUrl: "https://example.com/docs"
        })}
        installPlatform="html"
        copiedSnippet={false}
        verificationState="idle"
        verificationError=""
        onSetInstallPlatform={vi.fn()}
        onCopySnippet={vi.fn()}
        onVerifyInstallation={vi.fn()}
      />
    );

    expect(html).toContain("Snippet detected on https://example.com/docs");
    expect(html).toContain("Verified");
  });

  it("uses the historical-activity copy when conversations already exist", () => {
    const html = renderToStaticMarkup(
      <WidgetInstallationPanel
        activeSite={createSite({
          widgetLastSeenAt: null,
          widgetInstallVerifiedAt: null,
          conversationCount: 4
        })}
        installPlatform="html"
        copiedSnippet={false}
        verificationState="idle"
        verificationError=""
        onSetInstallPlatform={vi.fn()}
        onCopySnippet={vi.fn()}
        onVerifyInstallation={vi.fn()}
      />
    );

    expect(html).toContain("Conversations have already been recorded for this site.");
    expect(html).toContain("Historical activity confirms the widget was active.");
  });

  it("shows the domainless unverified guidance and still wires the check action", () => {
    const onVerifyInstallation = vi.fn();
    const tree = WidgetInstallationPanel({
      activeSite: createSite({
        conversationCount: 0,
        domain: null,
        widgetLastSeenAt: null,
        widgetInstallVerifiedAt: null
      }),
      installPlatform: "html",
      copiedSnippet: false,
      verificationState: "idle",
      verificationError: "",
      onSetInstallPlatform: vi.fn(),
      onCopySnippet: vi.fn(),
      onVerifyInstallation
    });
    const html = renderToStaticMarkup(tree);

    collectButtons(tree)
      .find((button) => textContent(button.props.children).includes("Check installation"))
      ?.props.onClick();

    expect(html).toContain("Widget not detected");
    expect(html).toContain("Save your site URL, then add the snippet and check again.");
    expect(onVerifyInstallation).toHaveBeenCalled();
  });
});
