import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createVisitor } from "./dashboard-visitors-page.test-helpers";
import {
  EmptyVisitorsCard,
  LiveVisitorsSection,
  RecentVisitorsSection
} from "./dashboard-visitors-page-lists";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as ReactElement;
  return [
    ...(predicate(element) ? [element] : []),
    ...collectElements(element.props?.children, predicate)
  ];
}

describe("dashboard visitors page lists", () => {
  it("renders empty cards and live visitor cards with refresh and selection actions", () => {
    const onRefresh = vi.fn();
    const onOpenConversation = vi.fn();
    const onSelectVisitor = vi.fn();
    const liveTree = LiveVisitorsSection({
      liveVisitors: [createVisitor()],
      refreshing: true,
      onRefresh,
      onOpenConversation,
      onSelectVisitor
    });
    const buttons = collectElements(liveTree, (element) => element.type === "button");
    const idleLiveHtml = renderToStaticMarkup(
      <LiveVisitorsSection
        liveVisitors={[createVisitor()]}
        refreshing={false}
        onRefresh={vi.fn()}
        onOpenConversation={vi.fn()}
        onSelectVisitor={vi.fn()}
      />
    );

    expect(renderToStaticMarkup(<EmptyVisitorsCard refreshingFilters />)).toContain("No visitors found");
    expect(renderToStaticMarkup(liveTree)).toContain("Live now");
    expect(renderToStaticMarkup(liveTree)).toContain("Auto-updating");
    expect(idleLiveHtml).not.toContain("Auto-updating");
    buttons[0]?.props.onClick();
    buttons[1]?.props.onClick();
    buttons[2]?.props.onClick();

    expect(onRefresh).toHaveBeenCalled();
    expect(onSelectVisitor).toHaveBeenCalledWith("visitor_1");
    expect(onOpenConversation).toHaveBeenCalledWith(expect.objectContaining({ id: "visitor_1" }));
  });

  it("renders recent visitors, sorting controls, row actions, and pagination", () => {
    const onExport = vi.fn();
    const onToggleSort = vi.fn();
    const onOpenConversation = vi.fn();
    const onSelectVisitor = vi.fn();
    let currentPage = 1;
    const setCurrentPage = vi.fn((value: number | ((page: number) => number)) => {
      currentPage = typeof value === "function" ? value(currentPage) : value;
    });
    const tree = RecentVisitorsSection({
      filteredVisitors: [createVisitor(), createVisitor({ id: "visitor_2", name: "Emma Stone" })],
      paginatedVisitors: [createVisitor()],
      sortKey: "lastSeen",
      sortDirection: "desc",
      refreshingFilters: false,
      safeCurrentPage: 1,
      pageCount: 2,
      currentPage,
      onExport,
      onToggleSort,
      onOpenConversation,
      onSelectVisitor,
      setCurrentPage
    });
    const buttons = collectElements(tree, (element) => element.type === "button");
    const rows = collectElements(tree, (element) => element.type === "tr");

    expect(renderToStaticMarkup(tree)).toContain("Recent visitors");
    expect(renderToStaticMarkup(tree)).toContain("Showing 1-2 of 2 visitors");
    buttons[0]?.props.onClick();
    buttons[1]?.props.onClick();
    rows[1]?.props.onClick();
    buttons[7]?.props.onClick({ stopPropagation: vi.fn() });
    buttons.at(-1)?.props.onClick();

    expect(onExport).toHaveBeenCalled();
    expect(onToggleSort).toHaveBeenCalledWith("visitor");
    expect(onSelectVisitor).toHaveBeenCalledWith("visitor_1");
    expect(onOpenConversation).toHaveBeenCalledWith(expect.objectContaining({ id: "visitor_1" }));
    expect(currentPage).toBe(2);
  });

  it("falls back to the empty filtered state when no recent visitors remain", () => {
    const html = renderToStaticMarkup(
      <RecentVisitorsSection
        filteredVisitors={[]}
        paginatedVisitors={[]}
        sortKey="lastSeen"
        sortDirection="desc"
        refreshingFilters={false}
        safeCurrentPage={1}
        pageCount={1}
        currentPage={1}
        onExport={vi.fn()}
        onToggleSort={vi.fn()}
        onOpenConversation={vi.fn()}
        onSelectVisitor={vi.fn()}
        setCurrentPage={vi.fn()}
      />
    );

    expect(html).toContain("No visitors in this time range");
  });
});
