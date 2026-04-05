"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContactListPayload } from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../ui/toast-provider";
import { DashboardContactDrawer } from "./dashboard-contact-drawer";
import {
  DEFAULT_CONTACT_FILTERS,
  exportContactsCsv,
  filterContacts,
  sortContacts,
  type ContactFilterState,
  type ContactSortKey
} from "./dashboard-contacts-utils";
import { ActiveContactFilters, DashboardContactsFilters } from "./dashboard-contacts-filters";
import { DashboardContactsDeleteModal, DashboardContactsExportModal } from "./dashboard-contacts-modals";
import {
  getCachedContactsPayload,
  loadContactsPayload,
  replaceCachedContact,
  replaceCachedContactSettings
} from "./dashboard-contacts-loader";
import { ContactsSkeleton, DashboardContactsTable } from "./dashboard-contacts-table";
import { FilterIcon, SearchIcon } from "./dashboard-ui";

const PAGE_SIZE = 25;

export function DashboardContactsPanel({
  deeplinkContactId,
  onNavigateConversation
}: {
  deeplinkContactId?: string | null;
  onNavigateConversation: (conversationId: string) => void;
}) {
  const { showToast } = useToast();
  const [payload, setPayload] = useState<ContactListPayload | null>(() => getCachedContactsPayload());
  const [loading, setLoading] = useState(() => !getCachedContactsPayload());
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ContactFilterState>(DEFAULT_CONTACT_FILTERS);
  const [sortKey, setSortKey] = useState<ContactSortKey>("lastSeenDesc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkTag, setBulkTag] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [exportFields, setExportFields] = useState<string[]>(["name", "email", "company", "phone", "status", "tags", "firstSeen", "lastSeen", "conversations", "source"]);

  async function loadContacts(force = false) {
    if (force || !payload) {
      setLoading(true);
    }

    try {
      setPayload(await loadContactsPayload(force));
    } catch (error) {
      showToast("error", "We couldn't load contacts.", error instanceof Error ? error.message : "Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!payload) {
      void loadContacts();
    }
  }, [payload]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(searchInput), 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (deeplinkContactId && payload?.contacts.some((contact) => contact.id === deeplinkContactId)) {
      setActiveContactId(deeplinkContactId);
    }
  }, [deeplinkContactId, payload]);

  const filteredContacts = useMemo(() => {
    if (!payload) {
      return [];
    }

    return sortContacts(filterContacts(payload.contacts, searchQuery, filters), sortKey);
  }, [filters, payload, searchQuery, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredContacts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageContacts = filteredContacts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const exportContacts = selectedIds.length
    ? payload?.contacts.filter((contact) => selectedIds.includes(contact.id)) ?? []
    : filteredContacts;
  const filtersActive =
    Boolean(searchQuery) ||
    Boolean(filters.status) ||
    Boolean(filters.tag) ||
    filters.lastSeen !== "any" ||
    Object.values(filters.customFieldValues).some(Boolean);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters, sortKey]);

  async function runBulkMutation(body: Record<string, unknown>) {
    try {
      const response = await fetch("/api/contacts/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contactIds: selectedIds, ...body })
      });
      if (!response.ok) {
        throw new Error("Unable to update selected contacts.");
      }

      await loadContacts(true);
      setSelectedIds([]);
    } catch (error) {
      showToast("error", "We couldn't update those contacts.", error instanceof Error ? error.message : "Please try again in a moment.");
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative block">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.currentTarget.value)}
                placeholder="Search by name, email, or company..."
                className="pl-10 md:w-[320px]"
              />
            </label>
            <select value={sortKey} onChange={(event) => setSortKey(event.currentTarget.value as ContactSortKey)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
              <option value="lastSeenDesc">Last seen (newest first)</option>
              <option value="lastSeenAsc">Last seen (oldest first)</option>
              <option value="firstSeenDesc">First seen (newest first)</option>
              <option value="firstSeenAsc">First seen (oldest first)</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="conversationsDesc">Conversations (most first)</option>
              <option value="conversationsAsc">Conversations (least first)</option>
            </select>
            <Button type="button" variant="secondary" size="md" onClick={() => setShowFilters((current) => !current)} leadingIcon={<FilterIcon className="h-4 w-4" />}>
              Filters
            </Button>
          </div>
        </div>

        {showFilters && payload ? (
          <DashboardContactsFilters
            filters={filters}
            statuses={payload.settings.statuses}
            customFields={payload.settings.customFields}
            contacts={payload.contacts}
            onChange={setFilters}
          />
        ) : null}

        {filtersActive ? (
          <ActiveContactFilters
            searchQuery={searchQuery}
            filters={filters}
            onRemoveSearch={() => {
              setSearchInput("");
              setSearchQuery("");
            }}
            onRemoveStatus={() => setFilters((current) => ({ ...current, status: "" }))}
            onRemoveTag={() => setFilters((current) => ({ ...current, tag: "" }))}
            onRemoveLastSeen={() => setFilters((current) => ({ ...current, lastSeen: "any" }))}
            onRemoveCustomField={(fieldKey) =>
              setFilters((current) => ({
                ...current,
                customFieldValues: { ...current.customFieldValues, [fieldKey]: "" }
              }))
            }
            onClearAll={() => {
              setSearchInput("");
              setSearchQuery("");
              setFilters(DEFAULT_CONTACT_FILTERS);
            }}
          />
        ) : null}

        {selectedIds.length ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-sm font-medium text-slate-900">{selectedIds.length} selected</p>
            <Input value={bulkTag} onChange={(event) => setBulkTag(event.currentTarget.value)} placeholder="Add tag" className="max-w-[180px]" />
            <Button type="button" variant="secondary" size="md" onClick={() => void runBulkMutation({ addTag: bulkTag.trim().toLowerCase() })}>
              Add tag
            </Button>
            <select value={bulkStatus} onChange={(event) => setBulkStatus(event.currentTarget.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
              <option value="">Change status</option>
              {payload?.settings.statuses.map((status) => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
            <Button type="button" variant="secondary" size="md" onClick={() => void runBulkMutation({ status: bulkStatus })}>
              Apply status
            </Button>
            <Button type="button" variant="secondary" size="md" disabled={!payload?.limits.exportEnabled} onClick={() => setShowExport(true)}>
              Export
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={() => setShowBulkDelete(true)}>
              Delete
            </Button>
          </div>
        ) : null}

        {loading || !payload ? (
          <ContactsSkeleton />
        ) : filteredContacts.length ? (
          <DashboardContactsTable
            contacts={pageContacts}
            statuses={payload.settings.statuses}
            selectedIds={selectedIds}
            safePage={safePage}
            pageCount={pageCount}
            totalContacts={filteredContacts.length}
            onToggleAll={(checked) =>
              setSelectedIds(checked
                ? Array.from(new Set([...selectedIds, ...pageContacts.map((contact) => contact.id)]))
                : selectedIds.filter((id) => !pageContacts.some((contact) => contact.id === id)))
            }
            onToggleOne={(contactId, checked) =>
              setSelectedIds(checked
                ? [...selectedIds, contactId]
                : selectedIds.filter((id) => id !== contactId))
            }
            onOpenContact={setActiveContactId}
            onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
            onNextPage={() => setPage((current) => Math.min(pageCount, current + 1))}
          />
        ) : payload.contacts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-base font-medium text-slate-900">No contacts yet</p>
            <p className="mt-2 text-sm text-slate-500">
              When visitors share their email, they&apos;ll appear here with conversation history and contact memory.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-base font-medium text-slate-900">No contacts found</p>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters.</p>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setFilters(DEFAULT_CONTACT_FILTERS);
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <DashboardContactDrawer
        contactId={activeContactId}
        initialStatuses={payload?.settings.statuses}
        initialCustomFields={payload?.settings.customFields}
        initialPlanKey={payload?.planKey}
        initialTagOptions={payload?.tagOptions}
        onClose={() => setActiveContactId(null)}
        onContactUpdated={(contact) => {
          replaceCachedContact(contact);
          setPayload((current) => current ? {
            ...current,
            contacts: current.contacts.map((entry) => entry.id === contact.id ? contact : entry)
          } : current);
        }}
        onSettingsUpdated={(settings) => {
          replaceCachedContactSettings(settings);
          setPayload((current) =>
            current
              ? {
                  ...current,
                  settings: {
                    ...current.settings,
                    statuses: settings.statuses,
                    customFields: settings.customFields
                  },
                  planKey: settings.planKey
                }
              : current
          );
        }}
        onNavigateConversation={onNavigateConversation}
      />

      {showExport && payload ? (
        <DashboardContactsExportModal
          payload={payload}
          contacts={exportContacts}
          exportFields={exportFields}
          onToggleField={(field, checked) =>
            setExportFields((current) =>
              checked ? [...current, field] : current.filter((entry) => entry !== field)
            )
          }
          onExport={async () => {
            try {
              const response = await fetch("/api/contacts/bulk", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  contactIds: exportContacts.map((contact) => contact.id),
                  exportContacts: true,
                  exportFieldKeys: exportFields
                })
              });
              if (!response.ok) {
                throw new Error("Unable to record export.");
              }

              exportContactsCsv(exportContacts, exportFields);
              setShowExport(false);
            } catch (error) {
              showToast("error", "We couldn't export contacts.", error instanceof Error ? error.message : "Please try again in a moment.");
            }
          }}
          onClose={() => setShowExport(false)}
        />
      ) : null}

      {showBulkDelete ? (
        <DashboardContactsDeleteModal
          count={selectedIds.length}
          onClose={() => setShowBulkDelete(false)}
          onConfirm={() => runBulkMutation({ deleteContacts: true })}
        />
      ) : null}
    </>
  );
}
