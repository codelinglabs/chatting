import { createVisitor, createVisitorFilters } from "./dashboard-visitors-page.test-helpers";
import {
  exportVisitors,
  filterVisitors,
  sortVisitors,
  withinTimeRange
} from "./dashboard-visitors-page.utils";

describe("dashboard visitors page utils", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("checks visitor age within the supported time ranges", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    expect(withinTimeRange(new Date(now - 60_000).toISOString(), "24h")).toBe(true);
    expect(withinTimeRange(new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(), "7d")).toBe(false);
    expect(withinTimeRange(new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString(), "30d")).toBe(true);
    expect(withinTimeRange(new Date(now - 365 * 24 * 60 * 60 * 1000).toISOString(), "all")).toBe(true);
  });

  it("sorts and filters visitors across the supported criteria", () => {
    const visitors = [
      createVisitor(),
      createVisitor({
        id: "visitor_2",
        name: "Emma Stone",
        email: null,
        location: "Paris, France",
        currentPage: "/docs",
        source: "Direct",
        sourceCategory: "direct",
        timeOnSiteSeconds: 20,
        conversationCount: 1,
        online: false,
        returnedVisitor: false,
        newVisitor: true,
        hasEmail: false,
        hasConversation: false
      })
    ];

    expect(sortVisitors(visitors, "visitor", "asc").map(({ id }) => id)).toEqual(["visitor_1", "visitor_2"]);
    expect(sortVisitors(visitors, "timeOnSite", "desc")[0]?.id).toBe("visitor_1");
    expect(
      filterVisitors(
        visitors,
        "paris",
        "new",
        "all",
        createVisitorFilters({
          status: "offline",
          locationQuery: "paris",
          source: "direct",
          pageQuery: "/docs",
          visitCount: "first",
          timeOnSite: "<1",
          hasEmail: "no",
          hasConversation: "no"
        })
      ).map(({ id }) => id)
    ).toEqual(["visitor_2"]);
  });

  it("exports visitors as a downloadable CSV", () => {
    const appendChild = vi.fn();
    const remove = vi.fn();
    const click = vi.fn();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:visitors"),
      revokeObjectURL
    });
    vi.stubGlobal("document", {
      body: { appendChild },
      createElement: vi.fn(() => ({
        href: "",
        download: "",
        click,
        remove
      }))
    });

    exportVisitors([createVisitor()]);

    expect((globalThis.URL as typeof URL).createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:visitors");
  });
});
