import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("./dashboard-shell-navigation", async () => {
  const actual = await vi.importActual<typeof import("./dashboard-shell-navigation")>(
    "./dashboard-shell-navigation"
  );

  return {
    ...actual,
    DashboardLink: ({
      href,
      children,
      ...props
    }: {
      href: string;
      children: ReactNode;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    )
  };
});

import {
  DashboardHeader,
  DashboardMain,
  DesktopSidebar,
  MobileChrome,
  PendingOverlay,
  dashboardGreeting,
  getDashboardIdentity,
  routeHeaderText
} from "./dashboard-shell-layout";

describe("dashboard shell layout", () => {
  it("builds dashboard identity from the user email", () => {
    expect(getDashboardIdentity("tina.bauer@usechatting.com")).toEqual({
      displayName: "Tina Bauer",
      firstName: "Tina",
      initials: "TB"
    });
  });

  it("returns the expected route header text and greeting", () => {
    expect(routeHeaderText("/dashboard", "Tina", "Good morning")).toEqual({
      title: "Good morning, Tina",
      subtitle: "Here's what's happening with your conversations"
    });
    expect(routeHeaderText("/dashboard/analytics", "Tina", "Hello").title).toBe("Analytics");
    expect(routeHeaderText("/dashboard/unknown", "Tina", "Hello").title).toBe("Dashboard");
    expect(dashboardGreeting(null)).toBe("Hello");
    expect(dashboardGreeting(9)).toBe("Good morning");
  });

  it("renders both pending overlay variants", () => {
    const inboxHtml = renderToStaticMarkup(<PendingOverlay isInboxRoute />);
    const pageHtml = renderToStaticMarkup(<PendingOverlay isInboxRoute={false} />);

    expect(inboxHtml).toContain("pointer-events-none absolute inset-0 z-10 bg-white");
    expect(inboxHtml).toContain("lg:grid-cols-[280px_minmax(0,1fr)_300px]");
    expect(pageHtml).toContain("pointer-events-none absolute inset-0 z-10 bg-slate-50");
    expect(pageHtml).toContain("xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]");
  });

  it("renders mobile and desktop navigation chrome", () => {
    const mobileHtml = renderToStaticMarkup(<MobileChrome pathname="/dashboard/inbox" unreadCount={3} />);
    const sidebarHtml = renderToStaticMarkup(
      <DesktopSidebar
        pathname="/dashboard/visitors"
        unreadCount={2}
        initials="TB"
        displayName="Tina Bauer"
        userEmail="tina@usechatting.com"
      />
    );

    expect(mobileHtml).toContain("Chatting");
    expect(mobileHtml).toContain("Log out");
    expect(mobileHtml).toContain("Inbox");
    expect(mobileHtml).toContain(">3<");
    expect(sidebarHtml).toContain("Visitors");
    expect(sidebarHtml).toContain("tina@usechatting.com");
    expect(sidebarHtml).toContain("Chatting");
  });

  it("renders the dashboard header with and without the inbox unread badge", () => {
    const headerHtml = renderToStaticMarkup(
      <DashboardHeader
        headerText={{ title: "Inbox", subtitle: "Stay on top of replies." }}
        showUnreadBadge
        unreadCount={4}
        initials="TB"
        firstName="Tina"
      />
    );
    const withoutBadgeHtml = renderToStaticMarkup(
      <DashboardHeader
        headerText={{ title: "Analytics" }}
        showUnreadBadge={false}
        unreadCount={4}
        initials="TB"
        firstName="Tina"
      />
    );

    expect(headerHtml).toContain("Inbox");
    expect(headerHtml).toContain("Stay on top of replies.");
    expect(headerHtml).toContain("4 unread");
    expect(withoutBadgeHtml).not.toContain("unread");
  });

  it("renders inbox and standard main layouts", () => {
    const inboxHtml = renderToStaticMarkup(
      <DashboardMain isInboxRoute showPendingOverlay>
        <section>Inbox content</section>
      </DashboardMain>
    );
    const pageHtml = renderToStaticMarkup(
      <DashboardMain isInboxRoute={false} showPendingOverlay={false}>
        <section>Settings content</section>
      </DashboardMain>
    );

    expect(inboxHtml).toContain("lg:flex-1 lg:min-h-0 lg:overflow-hidden");
    expect(inboxHtml).toContain("pointer-events-none opacity-0");
    expect(inboxHtml).toContain("Inbox content");
    expect(pageHtml).toContain("px-4 py-6 sm:px-6 lg:px-8");
    expect(pageHtml).toContain("Settings content");
  });
});
