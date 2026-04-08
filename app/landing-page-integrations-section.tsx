type IntegrationId = "slack" | "zapier" | "shopify" | "webhooks";
const integrations: Array<{ body: string; id: IntegrationId; title: string }> = [
  { id: "slack", title: "Slack", body: "Get notified in Slack. Reply from Slack. Never leave your workflow." },
  { id: "zapier", title: "Zapier", body: "Connect to 5,000+ apps. Push leads to your CRM. Trigger automations. No code." },
  { id: "shopify", title: "Shopify", body: "See order history in the chat sidebar. Know who you're helping." },
  { id: "webhooks", title: "Webhooks", body: "Send events anywhere. Build custom integrations. Real-time." }
] as const;
function IntegrationMark({ id }: { id: IntegrationId }) {
  if (id === "slack") {
    return (
      <span className="grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((dot) => (
          <span key={dot} className="h-1.5 w-1.5 rounded-full bg-current" />
        ))}
      </span>
    );
  }
  if (id === "zapier") return <span className="text-lg font-semibold leading-none">+</span>;
  if (id === "shopify") {
    return (
      <span className="relative h-4 w-4 rounded-[5px] border border-current">
        <span className="absolute left-1/2 top-[-4px] h-1.5 w-2.5 -translate-x-1/2 rounded-full border border-current bg-white" />
      </span>
    );
  }
  return <span className="text-[12px] font-semibold tracking-[-0.08em]">{"{ }"}</span>;
}
function IntegrationVisual({ id }: { id: IntegrationId }) {
  if (id === "slack") {
    return (
      <div className="overflow-hidden rounded-[18px] border border-[#E8E2F0] bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-[12px] font-semibold text-[#4A154B]">#sales-alerts</div>
        <div className="space-y-3 px-4 py-4 text-[13px] text-slate-700">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EEE7F7] text-[11px] font-semibold text-[#4A154B]">C</div>
            <div className="min-w-0">
              <p className="text-[12px] text-slate-500">
                <span className="font-semibold text-slate-900">Chatting</span> 10:42 AM
              </p>
              <p className="mt-1 font-medium text-slate-900">New chat from Sarah Kim</p>
              <p className="mt-1">Page: /integrations/slack</p>
              <p className="mt-1 text-slate-500">Message: "How do I connect Slack alerts?"</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600">View in Chatting</span>
            <span className="rounded-full bg-[#F4E8FF] px-3 py-1 text-[11px] font-semibold text-[#6D28D9]">Reply in Slack</span>
          </div>
        </div>
      </div>
    );
  }
  if (id === "zapier") {
    return (
      <div className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#FFFBF7_0%,#FFFFFF_100%)] p-4">
        <div className="flex items-center gap-3">
          {[
            ["C", "Chatting", "New chat", "bg-blue-50 text-blue-700"],
            ["H", "HubSpot", "Create contact", "bg-orange-50 text-orange-700"]
          ].map(([badge, app, action, tone]) => (
            <div key={app} className="flex min-h-[92px] flex-1 flex-col justify-between rounded-[18px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${tone}`}>{badge}</span>
                {app}
              </div>
              <p className="text-[13px] text-slate-500">{action}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-orange-500">
          <span className="h-px w-10 bg-orange-300" />
          Trigger → action
          <span className="h-px w-10 bg-orange-300" />
        </div>
      </div>
    );
  }
  if (id === "shopify") {
    return (
      <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-emerald-50 text-emerald-700">
            <IntegrationMark id="shopify" />
          </span>
          Order history
        </div>
        <div className="space-y-4 px-4 py-4 text-[13px] text-slate-700">
          <div className="grid grid-cols-2 gap-3 rounded-[16px] bg-slate-50 p-3">
            <div>
              <p className="text-slate-500">Customer: Sarah Kim</p>
            </div>
            <div>
              <p className="text-slate-500">Orders: 3</p>
            </div>
            <div>
              <p className="text-slate-500">Total spent: $847</p>
            </div>
          </div>
          <div className="rounded-[16px] border border-slate-200 px-3 py-3">
            <p className="text-slate-500">Latest order:</p>
            <p className="mt-1 font-semibold text-slate-900">#4821 — $129</p>
            <p className="mt-1">Blue Widget (x2)</p>
            <p className="mt-2 inline-flex items-center gap-1 text-emerald-700">Shipped ✓</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-[18px] border border-slate-800 bg-slate-900 px-4 py-4 font-mono text-[12px] leading-6 text-slate-200">
      <p>{"{"}</p>
      <p className="pl-4">
        <span className="text-sky-300">"event"</span>: <span className="text-emerald-300">"chat.started"</span>,
      </p>
      <p className="pl-4">
        <span className="text-sky-300">"visitor"</span>: {"{"}
      </p>
      <p className="pl-8">
        <span className="text-sky-300">"name"</span>: <span className="text-emerald-300">"Priya Nair"</span>,
      </p>
      <p className="pl-8">
        <span className="text-sky-300">"email"</span>: <span className="text-emerald-300">"priya@company.com"</span>,
      </p>
      <p className="pl-8">
        <span className="text-sky-300">"page"</span>: <span className="text-emerald-300">"/contact"</span>
      </p>
      <p className="pl-4">{"},"}</p>
      <p className="pl-4">
        <span className="text-sky-300">"timestamp"</span>: <span className="text-emerald-300">"2025-01-15T10:42:00Z"</span>
      </p>
      <p>{"}"}</p>
    </div>
  );
}
function IntegrationCard({ body, id, title }: { body: string; id: IntegrationId; title: string }) {
  return (
    <article id={`integration-${id}`} className="scroll-mt-24 w-[300px] rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.05)] md:w-auto">
      <div className="flex items-center gap-3 text-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-50">
          <IntegrationMark id={id} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="mt-4">
        <IntegrationVisual id={id} />
      </div>
      <p className="mt-4 text-[15px] leading-7 text-slate-600">{body}</p>
    </article>
  );
}

export function LandingIntegrationsSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#FFFDF9_0%,#FFFFFF_100%)]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl px-2 text-center">
          <h2 className="display-font mt-5 text-4xl leading-[1.02] text-slate-900 sm:text-5xl lg:text-6xl">
            Works with your stack.
          </h2>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 px-2">
          {integrations.map(({ id, title }) => (
            <a
              key={id}
              href={`#integration-${id}`}
              className="flex h-[46px] items-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                <IntegrationMark id={id} />
              </span>
              {title}
            </a>
          ))}
        </div>
        <div className="mt-12 overflow-x-auto pb-3 md:hidden">
          <div className="flex w-max gap-5 px-2">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} {...integration} />
            ))}
          </div>
        </div>
        <div className="mt-12 hidden gap-5 px-2 md:grid md:grid-cols-2 md:items-start md:px-0">
          <div className="space-y-5">
            {integrations.filter(({ id }) => id === "slack" || id === "shopify").map((integration) => (
              <IntegrationCard key={integration.id} {...integration} />
            ))}
          </div>
          <div className="space-y-5">
            {integrations.filter(({ id }) => id === "zapier" || id === "webhooks").map((integration) => (
              <IntegrationCard key={integration.id} {...integration} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
