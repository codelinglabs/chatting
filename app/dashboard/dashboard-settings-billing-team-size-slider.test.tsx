import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "./test-react-hooks";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  if (typeof element.type === "function") {
    return collect((element.type as (props: unknown) => ReactNode)(element.props), predicate);
  }
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

async function loadSlider(summary: Record<string, unknown>) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>
  }));
  vi.doMock("@/lib/pricing", () => ({
    CHATTING_ANNUAL_SAVINGS_LABEL: "2 months free",
    CHATTING_GROWTH_CONTACT_TEAM_SIZE: 50,
    CHATTING_GROWTH_TIER_BREAKPOINTS: [1, 4, 10, 25, 50],
    getChattingGrowthPricingSummary: () => summary
  }));
  vi.doMock("./dashboard-ui", () => ({ UsersIcon: () => <svg /> }));
  const module = await import("./dashboard-settings-billing-team-size-slider");
  return { DashboardSettingsBillingTeamSizeSlider: module.DashboardSettingsBillingTeamSizeSlider, reactMocks };
}

describe("dashboard billing team size slider", () => {
  it("renders annual savings and wires interval and slider changes", async () => {
    const onIntervalChange = vi.fn();
    const onMemberCountChange = vi.fn();
    const { DashboardSettingsBillingTeamSizeSlider, reactMocks } = await loadSlider({
      memberCount: 12,
      memberLabel: "12 team members",
      totalCents: 96000
    });
    reactMocks.beginRender();
    const tree = DashboardSettingsBillingTeamSizeSlider({
      memberCount: 12,
      interval: "annual",
      onIntervalChange,
      onMemberCountChange
    });

    collect(tree, (element) => element.type === "button" && element.props.children === "Monthly")[0]?.props.onClick();
    collect(tree, (element) => element.type === "input")[0]?.props.onChange({ target: { value: "25" } });

    const html = renderToStaticMarkup(tree);
    expect(onIntervalChange).toHaveBeenCalledWith("monthly");
    expect(onMemberCountChange).toHaveBeenCalledWith(25);
    expect(html).toContain("2 months free");
    expect(html).toContain("12 team members");
  });

  it("supports hidden subtitles and custom-pricing aria copy while dragging", async () => {
    const { DashboardSettingsBillingTeamSizeSlider, reactMocks } = await loadSlider({
      memberCount: 50,
      memberLabel: "50 team members",
      totalCents: null
    });
    reactMocks.beginRender();
    let tree = DashboardSettingsBillingTeamSizeSlider({
      memberCount: 50,
      interval: "monthly",
      subtitle: null,
      onIntervalChange: vi.fn(),
      onMemberCountChange: vi.fn()
    });
    collect(tree, (element) => element.type === "input")[0]?.props.onPointerDown();
    reactMocks.beginRender();
    tree = DashboardSettingsBillingTeamSizeSlider({
      memberCount: 50,
      interval: "monthly",
      subtitle: null,
      onIntervalChange: vi.fn(),
      onMemberCountChange: vi.fn()
    });

    const html = renderToStaticMarkup(tree);
    expect(html).not.toContain("Preview Growth pricing.");
    expect(html).toContain("50+");
    expect(collect(tree, (element) => element.type === "input")[0]?.props["aria-valuetext"]).toBe("50 or more team members, custom pricing required");
  });
});
