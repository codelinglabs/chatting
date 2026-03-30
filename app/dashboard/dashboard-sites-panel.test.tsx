import type { FormEvent, ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getWidgetSnippet: vi.fn()
}));

vi.mock("@/lib/dashboard", () => ({
  getWidgetSnippet: mocks.getWidgetSnippet
}));

import { DashboardSitesPanel } from "./dashboard-sites-panel";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

describe("dashboard sites panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWidgetSnippet.mockReturnValue("<script data-chatting></script>");
  });

  it("renders site details and the generated widget snippet", () => {
    const html = renderToStaticMarkup(
      <DashboardSitesPanel
        sites={[{
          id: "site_1",
          name: "Main site",
          domain: "usechatting.com",
          conversationCount: 2,
          brandColor: "#2563EB",
          widgetTitle: "Talk to us",
          greetingText: "We usually reply in a few minutes."
        }]}
        savingSiteId={null}
        onSaveSiteTitle={async () => {}}
      />
    );

    expect(html).toContain("1 site");
    expect(html).toContain("Main site");
    expect(html).toContain("&lt;script data-chatting&gt;&lt;/script&gt;");
  });

  it("submits widget title updates and shows the saving state", async () => {
    const onSaveSiteTitle = vi.fn().mockResolvedValue(undefined);
    const tree = DashboardSitesPanel({
      sites: [{
        id: "site_1",
        name: "Main site",
        domain: "",
        conversationCount: 1,
        brandColor: "#2563EB",
        widgetTitle: "Talk to us",
        greetingText: "Hi there"
      }],
      savingSiteId: "site_1",
      onSaveSiteTitle
    });

    await collect(tree, (element) => element.type === "form")[0]?.props.onSubmit({
      preventDefault: vi.fn()
    } as FormEvent<HTMLFormElement>);

    expect(onSaveSiteTitle).toHaveBeenCalledWith(expect.objectContaining({ preventDefault: expect.any(Function) }), "site_1");
    expect(renderToStaticMarkup(tree)).toContain("Saving...");
  });
});
