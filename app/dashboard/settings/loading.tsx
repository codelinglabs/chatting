"use client";

import { useSearchParams } from "next/navigation";
import { DashboardSettingsScaffold } from "../dashboard-settings-scaffold";
import { getSettingsPageCopy } from "../dashboard-settings-page-copy";
import { resolveSettingsSection } from "../dashboard-settings-section";
import { SettingsSectionHeader } from "../dashboard-settings-shared";

function SettingsCardSkeleton({ rows }: { rows: number }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="animate-pulse">
        <div className="h-5 w-40 rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-64 rounded-full bg-slate-100" />
      </div>
      <div className="mt-6 space-y-3 animate-pulse">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-36 rounded-full bg-slate-100" />
              <div className="mt-2 h-3 w-56 max-w-full rounded-full bg-slate-100" />
            </div>
            <div className="h-6 w-11 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SettingsLoading() {
  const searchParams = useSearchParams();
  const activeSection = resolveSettingsSection(searchParams.get("section"));
  const pageCopy = getSettingsPageCopy(activeSection);

  return (
    <DashboardSettingsScaffold
      activeSection={activeSection}
      onSetActiveSection={() => {}}
      isDirty={false}
      isSaving={false}
      onDiscard={() => {}}
      onSave={() => {}}
    >
      <SettingsSectionHeader title={pageCopy.title} subtitle={pageCopy.subtitle} />
      <SettingsCardSkeleton rows={4} />
      <SettingsCardSkeleton rows={3} />
    </DashboardSettingsScaffold>
  );
}
