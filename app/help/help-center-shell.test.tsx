import { renderToStaticMarkup } from "react-dom/server";
import { HelpCenterBody, HelpCenterShell } from "./help-center-shell";

describe("help center shell", () => {
  it("renders the help-center shell and preserves paragraph breaks in article bodies", () => {
    const shellHtml = renderToStaticMarkup(
      <HelpCenterShell siteName="Docs" title="Billing" intro="Answers for customers." backHref="/help/site_1" backLabel="All articles">
        <div>Article content</div>
      </HelpCenterShell>
    );
    const bodyHtml = renderToStaticMarkup(
      <HelpCenterBody body={"First paragraph.\n\nSecond paragraph."} />
    );

    expect(shellHtml).toContain("Help center");
    expect(shellHtml).toContain("Docs");
    expect(shellHtml).toContain("All articles");
    expect(bodyHtml).toContain("First paragraph.");
    expect(bodyHtml).toContain("Second paragraph.");
  });
});
