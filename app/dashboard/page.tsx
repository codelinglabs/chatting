import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardBanner, getWidgetSnippet } from "@/lib/dashboard";
import {
  DEFAULT_TAGS,
  getConversationById,
  getDashboardStats,
  listConversationSummaries,
  listSitesForUser
} from "@/lib/data";
import type { ConversationSummary, DashboardStats, Site, ThreadMessage } from "@/lib/types";
import { classNames, formatDateTime, formatRelativeTime, truncate } from "@/lib/utils";

type DashboardPageProps = {
  searchParams: Promise<{
    id?: string;
    success?: string;
    error?: string;
  }>;
};

function StatCard({
  label,
  value,
  tone = "tide"
}: {
  label: string;
  value: string;
  tone?: "tide" | "coral";
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/80 p-5">
      <p className={classNames("text-xs uppercase tracking-[0.22em]", tone === "tide" ? "text-tide" : "text-coral")}>
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const [conversations, stats, sites] = await Promise.all([
    listConversationSummaries(user.id),
    getDashboardStats(user.id),
    listSitesForUser(user.id)
  ]);

  const activeId = params.id || conversations[0]?.id;
  const activeConversation = activeId ? await getConversationById(activeId, user.id) : null;
  const banner = getDashboardBanner(params.error, params.success);

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        <header className="glass-panel flex flex-col gap-5 rounded-[2rem] px-6 py-6 shadow-glow lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-tide">Workspace inbox</p>
            <h1 className="display-font mt-3 text-4xl leading-tight text-ink">
              Questions become account-level insight.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Signed in as {user.email}. Each site below gets its own widget snippet and all inbox
              data stays scoped to your account.
            </p>
          </div>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/25"
            >
              Log out
            </button>
          </form>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          <StatCard label="Conversations" value={String(stats.totalConversations)} />
          <StatCard label="Replied" value={String(stats.answeredConversations)} />
          <StatCard label="Helpful clicks" value={String(stats.helpfulResponses)} tone="coral" />
          <div className="rounded-[1.5rem] bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-tide">Top tags</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.topTags.length ? (
                stats.topTags.map((tag: DashboardStats["topTags"][number]) => (
                  <span
                    key={tag.tag}
                    className="rounded-full bg-sky px-3 py-1 text-xs font-medium text-tide"
                  >
                    {tag.tag} ({tag.count})
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No tagging data yet.</span>
              )}
            </div>
          </div>
        </section>

        {banner ? (
          <div
            className={classNames(
              "rounded-[1.5rem] px-4 py-3 text-sm",
              params.error
                ? "border border-rose-200 bg-rose-50 text-rose-700"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            )}
          >
            {banner}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-tide">Your sites</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Embed a widget per product or domain.</h2>
              </div>
              <span className="rounded-full bg-sky px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-tide">
                {sites.length} {sites.length === 1 ? "site" : "sites"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {sites.map((site: Site) => (
                <article key={site.id} className="rounded-[1.5rem] bg-white/80 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-ink">{site.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {site.domain || "Any domain"} · {site.conversationCount} conversation
                        {site.conversationCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span
                      className="h-5 w-5 rounded-full border border-black/10"
                      style={{ backgroundColor: site.brandColor }}
                    />
                  </div>

                  <div className="mt-4 rounded-[1.25rem] bg-ink p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">Widget snippet</p>
                    <pre className="mt-3 overflow-x-auto text-xs leading-6 text-white/90">
                      <code>{getWidgetSnippet(site)}</code>
                    </pre>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{site.greetingText}</p>
                </article>
              ))}

              <form action="/dashboard/sites" method="post" className="rounded-[1.5rem] bg-white/80 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-highlight">Add site</p>
                <div className="mt-4 space-y-3">
                  <input
                    name="name"
                    required
                    placeholder="Pricing site"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-tide"
                  />
                  <input
                    name="domain"
                    placeholder="pricing.example.com"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-tide"
                  />
                  <input
                    name="brandColor"
                    placeholder="#0f766e"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-tide"
                  />
                  <textarea
                    name="greetingText"
                    rows={4}
                    placeholder="Ask us anything before you bounce"
                    className="w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-tide"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  Create site
                </button>
              </form>
            </div>
          </div>

          <aside className="glass-panel rounded-[2rem] p-4">
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Newest threads
              </h2>
              <span className="text-xs text-slate-400">{conversations.length} total</span>
            </div>

            <div className="thread-scrollbar flex max-h-[84vh] flex-col gap-3 overflow-y-auto pr-1">
              {conversations.length ? (
                conversations.map((conversation: ConversationSummary) => {
                  const isActive = conversation.id === activeConversation?.id;
                  return (
                    <Link
                      key={conversation.id}
                      href={`/dashboard?id=${conversation.id}`}
                      className={classNames(
                        "rounded-[1.5rem] border px-4 py-4 transition",
                        isActive
                          ? "border-tide bg-sky/50 shadow-glow"
                          : "border-black/8 bg-white/75 hover:border-black/15 hover:bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-ink">
                          {conversation.email || conversation.siteName}
                        </p>
                        <span className="text-xs text-slate-500">
                          {conversation.lastMessageAt
                            ? formatRelativeTime(conversation.lastMessageAt)
                            : formatRelativeTime(conversation.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {truncate(conversation.lastMessagePreview || "No messages yet")}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-black/5 px-2 py-1">
                          {conversation.siteName}
                        </span>
                        <span className="rounded-full bg-black/5 px-2 py-1">
                          {conversation.pageUrl || "Unknown page"}
                        </span>
                        {conversation.helpful === true ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                            Helpful
                          </span>
                        ) : null}
                        {conversation.helpful === false ? (
                          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">
                            Not helpful
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] bg-white/70 px-5 py-6 text-sm text-slate-600">
                  No conversations yet. Copy one of your site snippets into a page and send a test
                  message.
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
          {activeConversation ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="rounded-[1.5rem] bg-white/80 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-tide">
                        {activeConversation.siteName}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-ink">
                        {activeConversation.email || "Unknown email"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Started {formatDateTime(activeConversation.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-sand px-4 py-3 text-sm text-slate-600">
                      <p>Page: {activeConversation.pageUrl || "Unknown"}</p>
                      <p className="mt-1">Session: {activeConversation.sessionId}</p>
                    </div>
                  </div>

                  <div className="thread-scrollbar mt-6 flex max-h-[48vh] flex-col gap-4 overflow-y-auto pr-1">
                    {activeConversation.messages.map((message: ThreadMessage) => (
                      <article
                        key={message.id}
                        className={classNames(
                          "max-w-[88%] rounded-[1.5rem] px-4 py-3 shadow-sm",
                          message.sender === "founder"
                            ? "ml-auto bg-ink text-white"
                            : "bg-sky text-ink"
                        )}
                      >
                        <p className="text-xs uppercase tracking-[0.18em] opacity-70">
                          {message.sender === "founder" ? "Founder" : "Visitor"}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </p>
                        <p className="mt-3 text-xs opacity-70">{formatDateTime(message.createdAt)}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] bg-white/80 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-ink">Reply by email</h3>
                    <p className="text-sm text-slate-500">
                      {activeConversation.email
                        ? `Will send to ${activeConversation.email}`
                        : "Add an email to unlock replies"}
                    </p>
                  </div>

                  {!activeConversation.email ? (
                    <form action="/dashboard/email" method="post" className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input type="hidden" name="conversationId" value={activeConversation.id} />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="founder@customer.com"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-tide"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-tide px-5 py-3 text-sm font-semibold text-white"
                      >
                        Save email
                      </button>
                    </form>
                  ) : null}

                  <form action="/dashboard/reply" method="post" className="mt-4 space-y-4">
                    <input type="hidden" name="conversationId" value={activeConversation.id} />
                    <textarea
                      name="content"
                      required
                      rows={6}
                      disabled={!activeConversation.email}
                      placeholder="Write a clear founder reply. The email includes helpful / not helpful links automatically."
                      className="w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-4 text-sm leading-6 outline-none transition focus:border-tide disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={!activeConversation.email}
                      className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition enabled:hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Send founder reply
                    </button>
                  </form>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-[1.5rem] bg-white/80 p-5">
                  <h3 className="text-lg font-semibold text-ink">Tag the thread</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {DEFAULT_TAGS.map((tag) => {
                      const active = activeConversation.tags.includes(tag);
                      return (
                        <form action="/dashboard/tags" method="post" key={tag}>
                          <input type="hidden" name="conversationId" value={activeConversation.id} />
                          <button
                            type="submit"
                            name="tag"
                            value={tag}
                            className={classNames(
                              "rounded-full px-4 py-2 text-sm font-medium transition",
                              active
                                ? "bg-tide text-white"
                                : "border border-black/10 bg-white text-slate-700 hover:border-black/20"
                            )}
                          >
                            {tag}
                          </button>
                        </form>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white/80 p-5 text-sm leading-6 text-slate-600">
                  <h3 className="text-lg font-semibold text-ink">Conversation context</h3>
                  <p className="mt-3">Site ID: {activeConversation.siteId}</p>
                  <p className="mt-2">Referrer: {activeConversation.referrer || "Direct / unavailable"}</p>
                  <p className="mt-2 break-all">
                    User agent: {activeConversation.userAgent || "Unavailable"}
                  </p>
                  <p className="mt-2">
                    Feedback:{" "}
                    {activeConversation.helpful === null
                      ? "Waiting for a helpful vote"
                      : activeConversation.helpful
                        ? "Helpful"
                        : "Not helpful"}
                  </p>
                </div>
              </aside>
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/80 px-6 py-8 text-sm text-slate-600">
              Select a conversation to inspect the thread.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
