import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, _options: unknown) =>
    ({ initialSites, initialBilling }: { initialSites: unknown; initialBilling: unknown }) =>
      <div data-sites={JSON.stringify(initialSites)} data-billing={JSON.stringify(initialBilling)}>dynamic-widget</div>
}));

import { DashboardWidgetPageClient } from "./widget-page-client";

describe("widget page client", () => {
  it("forwards initial widget props into the dynamically loaded page", () => {
    const html = renderToStaticMarkup(
      <DashboardWidgetPageClient
        initialSites={[{ id: "site_1" }] as never}
        initialBilling={{ planKey: "growth" } as never}
      />
    );

    expect(html).toContain("dynamic-widget");
    expect(html).toContain("site_1");
    expect(html).toContain("growth");
  });
});
