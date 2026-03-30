"use client";

import { DashboardSettingsScaffold } from "../dashboard-settings-scaffold";

function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 w-40 rounded bg-slate-100" />
        <div className="mt-3 h-4 w-72 rounded bg-slate-100" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-100" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-36 rounded bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-50" />
          <div className="h-24 rounded-xl bg-slate-50" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <DashboardSettingsScaffold
      activeSection="profile"
      onSetActiveSection={() => {}}
      isDirty={false}
      isSaving={false}
      onDiscard={() => {}}
      onSave={() => {}}
    >
      <SettingsLoadingSkeleton />
    </DashboardSettingsScaffold>
  );
}
