import { renderToStaticMarkup } from "react-dom/server";
import { DashboardHelpCenterModal } from "./dashboard-help-center-modal";

describe("dashboard help center modal", () => {
  it("renders title, slug, and article body fields", () => {
    const html = renderToStaticMarkup(
      <DashboardHelpCenterModal
        title="New article"
        values={{ title: "Billing", slug: "billing", body: "Answer" }}
        saving={false}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn(async () => {})}
      />
    );

    expect(html).toContain("Article title");
    expect(html).toContain("Slug");
    expect(html).toContain("Article body");
    expect(html).toContain("We&#x27;ll use this in the public help-center URL.");
  });
});
