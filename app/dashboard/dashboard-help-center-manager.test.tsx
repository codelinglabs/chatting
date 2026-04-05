import { renderToStaticMarkup } from "react-dom/server";
import { DashboardHelpCenterManager } from "./dashboard-help-center-manager";

describe("help center manager", () => {
  it("uses the shared settings body rail without a duplicate page title", () => {
    const html = renderToStaticMarkup(
      <DashboardHelpCenterManager initialArticles={[]} initialSites={[]} canManage={false} />
    );

    expect(html).not.toContain(">Help center<");
    expect(html).not.toContain("Publish simple self-serve answers your team can link from chat.");
    expect(html).toContain("Public help center");
    expect(html).toContain("rounded-xl border border-slate-200 bg-white p-6");
    expect(html).toContain("-mx-6 border-t border-slate-200 px-6 py-5 grid items-start gap-4");
    expect(html).toContain("rounded-2xl border border-slate-200 bg-slate-50/70 p-4");
    expect(html).toContain("bg-gradient-to-br from-slate-50 to-white");
    expect(html).toContain("px-6 py-8 text-sm text-slate-500");
  });
});
