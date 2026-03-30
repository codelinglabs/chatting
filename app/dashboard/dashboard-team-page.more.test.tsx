import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

async function flushAsyncWork(cycles = 6) {
  for (let index = 0; index < cycles; index += 1) await Promise.resolve();
}

async function loadTeamPage() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./dashboard-controls", () => ({
    DASHBOARD_ICON_BUTTON_CLASS: "icon-button",
    DASHBOARD_INPUT_CLASS: "input",
    DASHBOARD_PRIMARY_BUTTON_CLASS: "primary-button",
    DASHBOARD_SECONDARY_BUTTON_CLASS: "secondary-button",
    DASHBOARD_SELECT_CLASS: "select",
    DashboardTopNotice: ({ notice }: { notice: unknown }) => ((captures.notice = notice), <div>notice</div>)
  }));

  const module = await import("./dashboard-team-page");
  return { DashboardTeamPage: module.DashboardTeamPage, captures, reactMocks };
}

describe("dashboard team page more", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders mixed member roles and hides team-management actions for non-managers", async () => {
    const { DashboardTeamPage } = await loadTeamPage();
    const html = renderToStaticMarkup(
      <DashboardTeamPage
        canManageTeam={false}
        initialMembers={[
          { id: "owner_1", name: "Tina", email: "tina@example.com", initials: "TB", role: "owner", status: "online", lastActiveLabel: "Now", isCurrentUser: true, avatarDataUrl: null },
          { id: "admin_1", name: "Alex", email: "alex@example.com", initials: "AL", role: "admin", status: "offline", lastActiveLabel: "1h ago", isCurrentUser: false, avatarDataUrl: "data:image/png;base64,avatar" },
          { id: "member_1", name: "Sam", email: "sam@example.com", initials: "SM", role: "member", status: "offline", lastActiveLabel: "Yesterday", isCurrentUser: false, avatarDataUrl: null }
        ]}
        initialInvites={[{ id: "invite_1", email: "casey@example.com", role: "member", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }]}
      />
    );

    expect(html).toContain("Owner");
    expect(html).toContain("Admin");
    expect(html).toContain("Member");
    expect(html).toContain("Online");
    expect(html).toContain("Offline");
    expect(html).toContain("Pending");
    expect(html).not.toContain("Invite member");
    expect(html).not.toContain("Manage invite for");
    expect(html).toContain("<img");
  });

  it("updates invite roles and removes invites", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, invites: [{ id: "invite_1", email: "alex@example.com", role: "admin", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, invites: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });

    const { DashboardTeamPage, captures, reactMocks } = await loadTeamPage();
    const props = {
      canManageTeam: true,
      initialMembers: [],
      initialInvites: [{ id: "invite_1", email: "alex@example.com", role: "member" as const, status: "pending" as const, message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }]
    };
    reactMocks.beginRender();
    let tree = DashboardTeamPage(props);

    collectElements(tree, (element) => element.type === "button" && element.props["aria-label"] === "Manage invite for alex@example.com")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardTeamPage(props);
    await runMockEffects(reactMocks.effects);
    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Make admin"))[0]?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardTeamPage(props);
    renderToStaticMarkup(tree);
    expect(captures.notice).toEqual({ tone: "success", message: "Role updated" });

    collectElements(tree, (element) => element.type === "button" && element.props["aria-label"] === "Manage invite for alex@example.com")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardTeamPage(props);
    await runMockEffects(reactMocks.effects);
    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Remove from team"))[0]?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardTeamPage(props);
    renderToStaticMarkup(tree);

    expect(captures.notice).toEqual({ tone: "success", message: "Invite removed" });
  });

  it("surfaces generic invite-action failures", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "team-action-failed" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });

    const { DashboardTeamPage, captures, reactMocks } = await loadTeamPage();
    const props = {
      canManageTeam: true,
      initialMembers: [],
      initialInvites: [{ id: "invite_1", email: "alex@example.com", role: "member" as const, status: "pending" as const, message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }]
    };
    reactMocks.beginRender();
    let tree = DashboardTeamPage(props);

    collectElements(tree, (element) => element.type === "button" && element.props["aria-label"] === "Manage invite for alex@example.com")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardTeamPage(props);
    await runMockEffects(reactMocks.effects);
    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Resend invite"))[0]?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardTeamPage(props);
    renderToStaticMarkup(tree);

    expect(captures.notice).toEqual({ tone: "error", message: "We couldn't update that invite." });
  });
});
