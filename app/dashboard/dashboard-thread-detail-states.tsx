import { ArrowLeftIcon, ChatBubbleIcon } from "./dashboard-ui";
import { conversationIdentity } from "./dashboard-conversation-display";

export function renderDashboardThreadDetailLoadingState(input: {
  email: string | null;
  showBackButton: boolean;
  showSidebarInline: boolean;
  onBack?: () => void;
}) {
  const loadingVisitor = conversationIdentity(input.email, "Anonymous visitor");

  return (
    <>
      <section className="flex h-full min-h-0 flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex min-w-0 items-center gap-3">
            {input.showBackButton && input.onBack ? (
              <button
                type="button"
                onClick={input.onBack}
                aria-label="Back to conversations"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-slate-900">{loadingVisitor.name}</p>
              <p className="truncate text-[13px] font-normal text-slate-500">{loadingVisitor.secondary}</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-white">
          <div className="px-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-600">Loading conversation...</p>
          </div>
        </div>
      </section>

      {input.showSidebarInline ? (
        <aside className="hidden h-full min-h-0 border-l border-slate-200 bg-white xl:flex xl:flex-col">
          <div className="flex h-full items-center justify-center px-8 text-center">
            <p className="text-sm leading-6 text-slate-500">Loading visitor details...</p>
          </div>
        </aside>
      ) : null}
    </>
  );
}

export function renderDashboardThreadDetailEmptyState(showSidebarInline: boolean) {
  return (
    <>
      <section className="flex h-full min-h-0 items-center justify-center bg-white">
        <div className="px-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
            <ChatBubbleIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-base font-medium text-slate-600">Select a conversation</h2>
          <p className="mt-2 text-sm text-slate-400">Choose a visitor from the list on the left.</p>
        </div>
      </section>

      {showSidebarInline ? (
        <aside className="hidden h-full min-h-0 border-l border-slate-200 bg-white xl:flex xl:flex-col">
          <div className="flex h-full items-center justify-center px-8 text-center">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Visitor Info</h3>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Session details, history, tags, and notes will appear here when you open a conversation.
              </p>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
