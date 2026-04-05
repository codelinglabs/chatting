import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createVisitorsData() {
  const now = new Date().toISOString();
  return {
    conversations: [
      {
        id: "conv_1",
        siteId: "site_1",
        siteName: "Chatting",
        email: "alex@example.com",
        sessionId: "session_1",
        status: "open" as const,
        createdAt: now,
        updatedAt: now,
        pageUrl: "/pricing",
        referrer: "google.com",
        userAgent: "Chrome",
        country: "United Kingdom",
        region: "England",
        city: "London",
        timezone: "Europe/London",
        locale: "en-GB",
        lastMessageAt: now,
        lastMessagePreview: "Pricing question",
        unreadCount: 1,
        rating: null,
        tags: ["lead"]
      }
    ],
    liveSessions: [
      {
        siteId: "site_1",
        sessionId: "live_1",
        conversationId: null,
        email: null,
        currentPageUrl: "/docs",
        referrer: "https://google.com",
        userAgent: "Safari",
        country: "United Kingdom",
        region: "England",
        city: "London",
        timezone: "Europe/London",
        locale: "en-GB",
        startedAt: now,
        lastSeenAt: now
      }
    ]
  };
}

async function flushAsyncWork(cycles = 6) {
  for (let index = 0; index < cycles; index += 1) {
    await Promise.resolve();
  }
}

async function loadVisitorsPage() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const navigate = vi.fn();
  const exportVisitors = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
  vi.doMock("./dashboard-shell", () => ({ useDashboardNavigation: () => ({ navigate }) }));
  vi.doMock("./dashboard-visitors-page-sections", () => ({
    VisitorsToolbar: (props: unknown) => ((captures.toolbar = props), <div>toolbar</div>),
    VisitorsFiltersPanel: (props: unknown) => ((captures.filters = props), <div>filters</div>),
    LiveVisitorsSection: (props: unknown) => ((captures.live = props), <div>live</div>),
    RecentVisitorsSection: (props: unknown) => ((captures.recent = props), <div>recent</div>),
    VisitorDetailsDrawer: (props: unknown) => ((captures.drawer = props), <div>drawer</div>)
  }));
  vi.doMock("./dashboard-visitors-page.utils", async () => {
    const actual = await vi.importActual<typeof import("./dashboard-visitors-page.utils")>("./dashboard-visitors-page.utils");
    return { ...actual, exportVisitors };
  });

  const module = await import("./dashboard-visitors-page");
  return { DashboardVisitorsPage: module.DashboardVisitorsPage, captures, exportVisitors, navigate, reactMocks };
}

describe("dashboard visitors page logic", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes visitors manually, patches live events incrementally, and routes conversation actions", async () => {
    const initial = createVisitorsData();
    const eventSources: Array<{ close: ReturnType<typeof vi.fn>; onmessage: ((event: { data: string }) => void) | null }> = [];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, conversations: [], liveSessions: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, summary: initial.conversations[0] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, session: initial.liveSessions[0] }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setInterval: vi.fn().mockReturnValue(7), clearInterval: vi.fn() });
    vi.stubGlobal("EventSource", class {
      close = vi.fn();
      onmessage: ((event: { data: string }) => void) | null = null;
      constructor() {
        eventSources.push(this);
      }
    });

    const { DashboardVisitorsPage, captures, navigate, reactMocks } = await loadVisitorsPage();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    const cleanups = await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);

    await (captures.recent as { onOpenConversation: (visitor: { latestConversationId: string }) => void }).onOpenConversation((captures.recent as {
      filteredVisitors: Array<{ latestConversationId: string }>;
    }).filteredVisitors[0]);
    await (captures.live as { onOpenConversation: (visitor: { id: string; latestConversationId: string | null }) => void }).onOpenConversation((captures.live as {
      liveVisitors: Array<{ id: string; latestConversationId: string | null }>;
    }).liveVisitors.find((visitor) => !visitor.latestConversationId)!);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);

    expect(navigate).toHaveBeenCalledWith("/dashboard/inbox?id=conv_1");
    expect((captures.drawer as { visitor: unknown }).visitor).toBeTruthy();

    await (captures.live as { onRefresh: () => Promise<void> }).onRefresh();
    await flushAsyncWork();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);

    eventSources[0]?.onmessage?.({ data: JSON.stringify({ type: "message.created", sender: "user", conversationId: "conv_1" }) });
    eventSources[0]?.onmessage?.({ data: JSON.stringify({ type: "visitor.presence.updated", siteId: "site_1", sessionId: "live_1" }) });
    await flushAsyncWork();
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/dashboard/visitors-data", { method: "GET", cache: "no-store" });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/dashboard/conversation-summary?conversationId=conv_1",
      { method: "GET", cache: "no-store" }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/dashboard/visitor-session?siteId=site_1&sessionId=live_1",
      { method: "GET", cache: "no-store" }
    );
    expect((captures.drawer as { visitor: unknown }).visitor).toBeNull();
    expect((captures.live as { refreshing: boolean }).refreshing).toBe(false);

    cleanups.forEach((cleanup) => cleanup());
    expect((globalThis.window as Window).clearInterval).toHaveBeenCalledWith(7);
    expect(eventSources[0]?.close).toHaveBeenCalled();
  });

  it("applies filters, resets pagination, toggles sorting, and exports the filtered list", async () => {
    const initial = createVisitorsData();
    vi.stubGlobal("window", { setInterval: vi.fn().mockReturnValue(7), clearInterval: vi.fn() });
    vi.stubGlobal("EventSource", class { close = vi.fn(); onmessage = null; });

    const { DashboardVisitorsPage, captures, exportVisitors, reactMocks } = await loadVisitorsPage();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);

    (captures.recent as { setCurrentPage: (page: number) => void }).setCurrentPage(2);
    (captures.toolbar as { onToggleFilters: () => void }).onToggleFilters();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    (captures.filters as { setDraftFilters: (updater: (current: { status: string }) => { status: string }) => void }).setDraftFilters(
      (current) => ({ ...current, status: "offline" })
    );
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    (captures.filters as { applyFilters: () => void }).applyFilters();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);

    (captures.recent as { onToggleSort: (key: string) => void }).onToggleSort("visitor");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    (captures.recent as { onToggleSort: (key: string) => void }).onToggleSort("visitor");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    (captures.recent as { onExport: () => void }).onExport();

    expect((captures.filters as { visible: boolean }).visible).toBe(false);
    expect((captures.recent as { currentPage: number }).currentPage).toBe(1);
    expect((captures.recent as { refreshingFilters: boolean }).refreshingFilters).toBe(true);
    expect((captures.recent as { sortDirection: string }).sortDirection).toBe("desc");
    expect(exportVisitors).toHaveBeenCalledWith((captures.recent as { filteredVisitors: unknown[] }).filteredVisitors);
  });
});
