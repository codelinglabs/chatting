import type { FormEvent } from "react";
import type { ConversationThread } from "@/lib/types";
import { DashboardThreadDetailSidebar } from "./dashboard-thread-detail-sidebar";
import { XIcon } from "./dashboard-ui";

export function renderDashboardThreadDetailSidebars(input: {
  activeConversation: ConversationThread;
  savingEmail: boolean;
  showSidebarInline: boolean;
  showSidebarDrawer: boolean;
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleTag: (tag: string) => Promise<void>;
  onCloseSidebar?: () => void;
}) {
  return (
    <>
      {input.showSidebarInline ? (
        <aside className="hidden h-full min-h-0 flex-col border-l border-slate-200 bg-white xl:flex">
          <DashboardThreadDetailSidebar
            activeConversation={input.activeConversation}
            savingEmail={input.savingEmail}
            onSaveConversationEmail={input.onSaveConversationEmail}
            onToggleTag={input.onToggleTag}
          />
        </aside>
      ) : null}

      {input.showSidebarDrawer ? (
        <div className="fixed inset-0 z-40 bg-slate-900/25 xl:hidden" onClick={input.onCloseSidebar}>
          <aside
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[300px] flex-col border-l border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5">
              <p className="text-sm font-medium text-slate-900">Visitor info</p>
              <button
                type="button"
                onClick={input.onCloseSidebar}
                aria-label="Close visitor info"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <DashboardThreadDetailSidebar
              activeConversation={input.activeConversation}
              savingEmail={input.savingEmail}
              onSaveConversationEmail={input.onSaveConversationEmail}
              onToggleTag={input.onToggleTag}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
