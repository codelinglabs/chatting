"use client";

import type { ContactCustomFieldDefinition, ContactStatusDefinition, ContactSummary } from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import type { ContactFilterState } from "./dashboard-contacts-utils";

const SELECT_CLASS_NAME =
  "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function DashboardContactsFilters({
  filters,
  statuses,
  customFields,
  contacts,
  onChange
}: {
  filters: ContactFilterState;
  statuses: ContactStatusDefinition[];
  customFields: ContactCustomFieldDefinition[];
  contacts: ContactSummary[];
  onChange: (next: ContactFilterState) => void;
}) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 xl:grid-cols-4">
      <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.currentTarget.value })} className={SELECT_CLASS_NAME}>
        <option value="">All statuses</option>
        {statuses.map((status) => (
          <option key={status.key} value={status.key}>{status.label}</option>
        ))}
      </select>
      <select value={filters.tag} onChange={(event) => onChange({ ...filters, tag: event.currentTarget.value })} className={SELECT_CLASS_NAME}>
        <option value="">All tags</option>
        {Array.from(new Set(contacts.flatMap((contact) => contact.tags))).map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
      <select value={filters.lastSeen} onChange={(event) => onChange({ ...filters, lastSeen: event.currentTarget.value as ContactFilterState["lastSeen"] })} className={SELECT_CLASS_NAME}>
        <option value="any">Any time</option>
        <option value="today">Today</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>
      {customFields.map((field) => {
        const values = Array.from(new Set(contacts.map((contact) => contact.customFields[field.key]).filter(Boolean)));
        return (
          <select
            key={field.id}
            value={filters.customFieldValues[field.key] ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                customFieldValues: { ...filters.customFieldValues, [field.key]: event.currentTarget.value }
              })
            }
            className={SELECT_CLASS_NAME}
          >
            <option value="">{field.label}: All</option>
            {values.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        );
      })}
    </div>
  );
}

export function ActiveContactFilters({
  searchQuery,
  filters,
  onRemoveSearch,
  onRemoveStatus,
  onRemoveTag,
  onRemoveLastSeen,
  onRemoveCustomField,
  onClearAll
}: {
  searchQuery: string;
  filters: ContactFilterState;
  onRemoveSearch: () => void;
  onRemoveStatus: () => void;
  onRemoveTag: () => void;
  onRemoveLastSeen: () => void;
  onRemoveCustomField: (fieldKey: string) => void;
  onClearAll: () => void;
}) {
  const customFieldEntries = Object.entries(filters.customFieldValues).filter(([, value]) => value);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {searchQuery ? <FilterPill label={`Search: ${searchQuery}`} onRemove={onRemoveSearch} /> : null}
      {filters.status ? <FilterPill label={`Status: ${filters.status}`} onRemove={onRemoveStatus} /> : null}
      {filters.tag ? <FilterPill label={`Tag: ${filters.tag}`} onRemove={onRemoveTag} /> : null}
      {filters.lastSeen !== "any" ? <FilterPill label={`Last seen: ${filters.lastSeen}`} onRemove={onRemoveLastSeen} /> : null}
      {customFieldEntries.map(([fieldKey, value]) => (
        <FilterPill key={fieldKey} label={`${fieldKey}: ${value}`} onRemove={() => onRemoveCustomField(fieldKey)} />
      ))}
      <Button type="button" variant="secondary" size="md" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 transition hover:bg-slate-200"
    >
      {label} ×
    </button>
  );
}
