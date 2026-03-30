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

describe("dashboard team page actions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("opens the invite modal, submits an invite, and resets the draft on success", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, invites: [{ id: "invite_1", email: "alex@example.com", role: "admin", status: "pending", message: "Join us", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }] })
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });

    const { DashboardTeamPage, captures, reactMocks } = await loadTeamPage();
    reactMocks.beginRender();
    let tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [{ id: "member_1", name: "Tina Bauer", email: "tina@usechatting.com", initials: "TB", role: "owner", status: "online", lastActiveLabel: "Just now", isCurrentUser: true, avatarDataUrl: null }], initialInvites: [] });

    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Invite member"))[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [{ id: "member_1", name: "Tina Bauer", email: "tina@usechatting.com", initials: "TB", role: "owner", status: "online", lastActiveLabel: "Just now", isCurrentUser: true, avatarDataUrl: null }], initialInvites: [] });
    collectElements(tree, (element) => element.type === "input")[0]?.props.onChange({ target: { value: "alex@example.com" } });
    collectElements(tree, (element) => element.type === "select")[0]?.props.onChange({ target: { value: "admin" } });
    collectElements(tree, (element) => element.type === "textarea")[0]?.props.onChange({ target: { value: "Join us" } });
    reactMocks.beginRender();
    tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [{ id: "member_1", name: "Tina Bauer", email: "tina@usechatting.com", initials: "TB", role: "owner", status: "online", lastActiveLabel: "Just now", isCurrentUser: true, avatarDataUrl: null }], initialInvites: [] });
    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Send invite"))[0]?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [{ id: "member_1", name: "Tina Bauer", email: "tina@usechatting.com", initials: "TB", role: "owner", status: "online", lastActiveLabel: "Just now", isCurrentUser: true, avatarDataUrl: null }], initialInvites: [] });
    await runMockEffects(reactMocks.effects);
    renderToStaticMarkup(tree);

    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({ action: "invite", email: "alex@example.com", role: "admin" });
    expect(captures.notice).toEqual({ tone: "success", message: "Invite sent" });
    expect(renderToStaticMarkup(tree)).toContain("alex@example.com");
    expect(renderToStaticMarkup(tree)).not.toContain("Invite team member");
    expect((globalThis.window as Window).setTimeout).toHaveBeenCalled();
  });

  it("shows missing-email errors and can resend a pending invite", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "missing-email" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, invites: [{ id: "invite_1", email: "alex@example.com", role: "member", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:10:00.000Z" }] }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });

    const { DashboardTeamPage, captures, reactMocks } = await loadTeamPage();
    reactMocks.beginRender();
    let tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [], initialInvites: [{ id: "invite_1", email: "alex@example.com", role: "admin", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }] });

    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Invite member"))[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [], initialInvites: [{ id: "invite_1", email: "alex@example.com", role: "admin", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }] });
    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Send invite"))[0]?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [], initialInvites: [{ id: "invite_1", email: "alex@example.com", role: "admin", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }] });
    renderToStaticMarkup(tree);
    expect(captures.notice).toEqual({ tone: "error", message: "Enter an email address before sending an invite." });

    collectElements(tree, (element) => element.type === "button" && element.props["aria-label"] === "Manage invite for alex@example.com")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [], initialInvites: [{ id: "invite_1", email: "alex@example.com", role: "admin", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }] });
    await runMockEffects(reactMocks.effects);
    collectElements(tree, (element) => element.type === "button" && textContent(element.props.children).includes("Resend invite"))[0]?.props.onClick();
    await flushAsyncWork();
    reactMocks.beginRender();
    tree = DashboardTeamPage({ canManageTeam: true, initialMembers: [], initialInvites: [{ id: "invite_1", email: "alex@example.com", role: "admin", status: "pending", message: "", createdAt: "2026-03-29T10:00:00.000Z", updatedAt: "2026-03-29T10:05:00.000Z" }] });
    renderToStaticMarkup(tree);

    expect(captures.notice).toEqual({ tone: "success", message: "Invite resent" });
    expect((globalThis.window as Window).addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
  });
});
