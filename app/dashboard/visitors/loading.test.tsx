import { renderToStaticMarkup } from "react-dom/server";
import VisitorsLoading from "./loading";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams()
}));

describe("dashboard visitors loading", () => {
  it("renders the live people skeleton instead of the generic dashboard loader", () => {
    const html = renderToStaticMarkup(<VisitorsLoading />);

    expect(html).toContain("Live now");
    expect(html).toContain("All contacts");
    expect(html).toContain("Live visitor activity");
    expect(html).toContain("Current / Last page");
    expect(html).not.toContain("xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]");
  });
});
