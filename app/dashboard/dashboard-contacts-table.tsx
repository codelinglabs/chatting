"use client";

import type { ContactStatusDefinition, ContactSummary } from "@/lib/contact-types";
import { formatRelativeTime } from "@/lib/utils";
import { DashboardContactAvatar } from "./dashboard-contact-avatar";
import { DashboardContactStatusBadge } from "./dashboard-contact-status-badge";
import { ChevronLeftIcon, ChevronRightIcon } from "./dashboard-ui";

export function ContactsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto animate-pulse">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.05em] text-slate-500">
              <th className="px-4 py-3">
                <div className="h-4 w-4 rounded bg-slate-100" />
              </th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last seen</th>
              <th className="px-4 py-3">Convos</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((row) => (
              <tr key={row} className="border-b border-slate-100 text-sm last:border-b-0">
                <td className="px-4 py-4">
                  <div className="h-4 w-4 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-28 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-40 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-20 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-6 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-slate-100" />
                    <div className="h-6 w-12 rounded-full bg-slate-100" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 animate-pulse">
        <div className="h-4 w-52 rounded bg-slate-100" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-slate-100" />
          <div className="h-4 w-3 rounded bg-slate-100" />
          <div className="h-9 w-9 rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function DashboardContactsTable({
  contacts,
  statuses,
  selectedIds,
  safePage,
  pageCount,
  totalContacts,
  onToggleAll,
  onToggleOne,
  onOpenContact,
  onPreviousPage,
  onNextPage
}: {
  contacts: ContactSummary[];
  statuses: ContactStatusDefinition[];
  selectedIds: string[];
  safePage: number;
  pageCount: number;
  totalContacts: number;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (contactId: string, checked: boolean) => void;
  onOpenContact: (contactId: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.05em] text-slate-500">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={contacts.length > 0 && contacts.every((contact) => selectedIds.includes(contact.id))}
                  onChange={(event) => onToggleAll(event.currentTarget.checked)}
                />
              </th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last seen</th>
              <th className="px-4 py-3">Convos</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                tabIndex={0}
                role="button"
                aria-label={`Open contact ${contact.name}`}
                onClick={() => onOpenContact(contact.id)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenContact(contact.id);
                  }
                }}
                className="cursor-pointer border-b border-slate-100 text-sm last:border-b-0 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(contact.id)}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    onChange={(event) => onToggleOne(contact.id, event.currentTarget.checked)}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 text-left">
                    <DashboardContactAvatar name={contact.name} avatarUrl={contact.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{contact.name}</p>
                      <p className="truncate text-slate-500">{contact.email}</p>
                      {contact.company ? <p className="truncate text-slate-400">{contact.company}</p> : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <DashboardContactStatusBadge statusKey={contact.status} statuses={statuses} />
                  {!contact.status || !statuses.some((status) => status.key === contact.status) ? "—" : null}
                </td>
                <td className="px-4 py-4 text-slate-600">{formatRelativeTime(contact.lastSeenAt)}</td>
                <td className="px-4 py-4 text-slate-600">{contact.conversationCount}</td>
                <td className="px-4 py-4 text-slate-600">{contact.tags.slice(0, 2).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
        <p>
          Showing {(safePage - 1) * 25 + 1}-{Math.min(safePage * 25, totalContacts)} of {totalContacts} contacts
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onPreviousPage} disabled={safePage === 1} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50">
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span>{safePage}</span>
          <button type="button" onClick={onNextPage} disabled={safePage === pageCount} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50">
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
