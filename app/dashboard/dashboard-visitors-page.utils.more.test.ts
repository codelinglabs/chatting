import { createVisitor, createVisitorFilters } from "./dashboard-visitors-page.test-helpers";
import { filterVisitors, sortVisitors } from "./dashboard-visitors-page.utils";

describe("dashboard visitors page utils more", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sorts by the supported fields and filters each advanced branch", () => {
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-03-29T12:00:00.000Z").getTime());
    const visitors = [
      createVisitor(),
      createVisitor({
        id: "visitor_2",
        name: "Bella Jones",
        location: null,
        currentPage: "/docs",
        source: "newsletter",
        sourceCategory: "email",
        conversationCount: 1,
        timeOnSiteSeconds: 45,
        online: false,
        returnedVisitor: false,
        newVisitor: true,
        hasEmail: false,
        hasConversation: false,
        lastSeenAt: "2026-03-20T10:10:00.000Z"
      }),
      createVisitor({
        id: "visitor_3",
        name: "Chris Adams",
        source: "twitter.com",
        sourceCategory: "social",
        conversationCount: 6,
        timeOnSiteSeconds: 360,
        hasConversation: true,
        lastSeenAt: "2026-03-29T10:20:00.000Z"
      })
    ];

    expect(sortVisitors(visitors, "location", "asc").map(({ id }) => id)).toEqual(["visitor_2", "visitor_1", "visitor_3"]);
    expect(sortVisitors(visitors, "page", "desc")[0]?.id).toBe("visitor_1");
    expect(sortVisitors(visitors, "source", "asc")[0]?.id).toBe("visitor_1");
    expect(sortVisitors(visitors, "lastSeen", "desc")[0]?.id).toBe("visitor_3");

    expect(filterVisitors(visitors, "", "online", "all", createVisitorFilters()).map(({ id }) => id)).toEqual([
      "visitor_1",
      "visitor_3"
    ]);
    expect(filterVisitors(visitors, "", "returned", "all", createVisitorFilters()).map(({ id }) => id)).toEqual([
      "visitor_1",
      "visitor_3"
    ]);
    expect(filterVisitors(visitors, "", "new", "all", createVisitorFilters()).map(({ id }) => id)).toEqual(["visitor_2"]);

    expect(
      filterVisitors(
        visitors,
        "twitter.com",
        "all",
        "24h",
        createVisitorFilters({
          status: "online",
          source: "social",
          pageQuery: "/pricing",
          visitCount: "5+",
          timeOnSite: "5+",
          hasEmail: "yes",
          hasConversation: "yes"
        })
      ).map(({ id }) => id)
    ).toEqual(["visitor_3"]);

    expect(
      filterVisitors(
        visitors,
        "bella",
        "all",
        "30d",
        createVisitorFilters({
          status: "offline",
          locationQuery: "",
          source: "email",
          pageQuery: "/docs",
          visitCount: "first",
          timeOnSite: "<1",
          hasEmail: "no",
          hasConversation: "no"
        })
      ).map(({ id }) => id)
    ).toEqual(["visitor_2"]);

    expect(
      filterVisitors(
        visitors,
        "",
        "all",
        "all",
        createVisitorFilters({ locationQuery: "london", visitCount: "2-5", timeOnSite: "1-5" })
      ).map(({ id }) => id)
    ).toEqual(["visitor_1"]);
  });
});
