"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ContactsSkeleton } from "./dashboard-contacts-table";
import { DashboardPeopleTabs } from "./dashboard-people-tabs";
import { VisitorsToolbar } from "./dashboard-visitors-page-toolbar";
import { FilterIcon, SearchIcon } from "./dashboard-ui";

const NOOP = () => {};

function LiveToolbarShell() {
  return (
    <VisitorsToolbar
      searchQuery=""
      primaryFilter="all"
      timeRange="7d"
      setSearchQuery={NOOP}
      setPrimaryFilter={NOOP}
      setTimeRange={NOOP}
      onToggleFilters={NOOP}
    />
  );
}

function LiveVisitorsSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-slate-100" />
          <div className="h-4 w-24 rounded-full bg-slate-100" />
          <div className="h-3 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-100" />
      </div>
      <div className="grid gap-4 p-5 animate-pulse" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {Array.from({ length: 3 }, (_, index) => (
          <article key={index} className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-slate-100" />
                <div>
                  <div className="h-4 w-28 rounded-full bg-slate-100" />
                  <div className="mt-2 h-3 w-36 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="h-4 w-12 rounded-full bg-slate-100" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-32 rounded-full bg-slate-100" />
              <div className="h-3 w-28 rounded-full bg-slate-100" />
            </div>
            <div className="mt-4 border-t border-slate-200 pt-3">
              <div className="h-3 w-24 rounded-full bg-slate-100" />
              <div className="mt-2 h-4 w-full rounded-full bg-slate-100" />
            </div>
            <div className="mt-3 h-3 w-40 rounded-full bg-slate-100" />
            <div className="mt-4 h-9 w-full rounded-lg bg-slate-100" />
          </article>
        ))}
      </div>
    </section>
  );
}

function RecentVisitorsSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 animate-pulse">
        <div className="h-4 w-28 rounded-full bg-slate-100" />
        <div className="h-8 w-20 rounded-md border border-slate-200 bg-white" />
      </div>
      <div className="overflow-x-auto animate-pulse">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.05em] text-slate-500">
              <th className="px-4 py-3">Visitor</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Current / Last page</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 text-right">Time on site</th>
              <th className="px-4 py-3 text-right">Last seen</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }, (_, index) => (
              <tr key={index} className="border-b border-slate-100 text-sm last:border-b-0">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100" />
                    <div>
                      <div className="h-4 w-24 rounded-full bg-slate-100" />
                      <div className="mt-2 h-3 w-32 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4"><div className="h-4 w-24 rounded-full bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="h-4 w-32 rounded-full bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="h-4 w-20 rounded-full bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="ml-auto h-4 w-14 rounded-full bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="ml-auto h-4 w-16 rounded-full bg-slate-100" /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-100" />
                    <div className="h-8 w-8 rounded-lg bg-slate-100" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 animate-pulse">
        <div className="h-4 w-56 rounded-full bg-slate-100" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-slate-100" />
          <div className="h-9 w-9 rounded-md bg-slate-100" />
          <div className="h-9 w-9 rounded-md bg-slate-100" />
        </div>
      </div>
    </section>
  );
}

function ContactsToolbarShell() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value=""
            onChange={NOOP}
            placeholder="Search by name, email, or company..."
            className="pl-10 md:w-[320px]"
          />
        </label>
        <select
          value="lastSeenDesc"
          onChange={NOOP}
          className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="lastSeenDesc">Last seen (newest first)</option>
        </select>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={NOOP}
          leadingIcon={<FilterIcon className="h-4 w-4" />}
        >
          Filters
        </Button>
      </div>
    </div>
  );
}

export function DashboardVisitorsLoading() {
  const searchParams = useSearchParams();
  const contacts = searchParams.get("tab") === "contacts" || Boolean(searchParams.get("contact"));

  return (
    <div className="space-y-6">
      <DashboardPeopleTabs activeTab={contacts ? "contacts" : "live"} />
      {contacts ? (
        <div className="space-y-5">
          <ContactsToolbarShell />
          <ContactsSkeleton />
        </div>
      ) : (
        <>
          <LiveToolbarShell />
          <LiveVisitorsSkeleton />
          <RecentVisitorsSkeleton />
        </>
      )}
    </div>
  );
}
