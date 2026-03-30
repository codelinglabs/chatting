import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createVisitorFilters } from "./dashboard-visitors-page.test-helpers";
import { VisitorsFiltersPanel, VisitorsToolbar } from "./dashboard-visitors-page-toolbar";

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

describe("dashboard visitors page toolbar", () => {
  it("renders toolbar controls and forwards search and filter changes", () => {
    const setSearchQuery = vi.fn();
    const setPrimaryFilter = vi.fn();
    const setTimeRange = vi.fn();
    const onToggleFilters = vi.fn();
    const tree = VisitorsToolbar({
      searchQuery: "alex",
      primaryFilter: "online",
      timeRange: "7d",
      setSearchQuery,
      setPrimaryFilter,
      setTimeRange,
      onToggleFilters
    });

    const inputs = collectElements(tree, (element) => element.type === "input");
    const selects = collectElements(
      tree,
      (element) => typeof element.type === "function" && "onChange" in (element.props ?? {})
    );
    const buttons = collectElements(tree, (element) => element.type === "button");

    expect(renderToStaticMarkup(tree)).toContain("Live visitor activity");
    inputs[0]?.props.onChange({ currentTarget: { value: "emma" } });
    buttons[0]?.props.onClick();
    selects[0]?.props.onChange("returned");
    selects[1]?.props.onChange("30d");
    buttons.at(-1)?.props.onClick();

    expect(setSearchQuery).toHaveBeenCalledWith("emma");
    expect(setSearchQuery).toHaveBeenCalledWith("");
    expect(setPrimaryFilter).toHaveBeenCalledWith("returned");
    expect(setTimeRange).toHaveBeenCalledWith("30d");
    expect(onToggleFilters).toHaveBeenCalled();
  });

  it("returns null when filters are hidden and updates draft filters when visible", () => {
    expect(
      VisitorsFiltersPanel({
        visible: false,
        draftFilters: createVisitorFilters(),
        setDraftFilters: vi.fn(),
        clearFilters: vi.fn(),
        applyFilters: vi.fn()
      })
    ).toBeNull();

    let draft = createVisitorFilters();
    const clearFilters = vi.fn();
    const applyFilters = vi.fn();
    const setDraftFilters = vi.fn((updater: (current: typeof draft) => typeof draft) => {
      draft = updater(draft);
    });
    const tree = VisitorsFiltersPanel({
      visible: true,
      draftFilters: draft,
      setDraftFilters,
      clearFilters,
      applyFilters
    });
    const controls = collectElements(
      tree,
      (element) => element.type === "select" || element.type === "input"
    );
    const buttons = collectElements(tree, (element) => element.type === "button");

    controls[0]?.props.onChange({ currentTarget: { value: "offline" } });
    controls[1]?.props.onChange({ currentTarget: { value: "london" } });
    controls[2]?.props.onChange({ currentTarget: { value: "social" } });
    controls[3]?.props.onChange({ currentTarget: { value: "/docs" } });
    buttons[0]?.props.onClick();
    buttons[1]?.props.onClick();

    expect(draft.status).toBe("offline");
    expect(draft.locationQuery).toBe("london");
    expect(draft.source).toBe("social");
    expect(draft.pageQuery).toBe("/docs");
    expect(clearFilters).toHaveBeenCalled();
    expect(applyFilters).toHaveBeenCalled();
  });
});
