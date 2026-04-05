"use client";

const PEOPLE_TABS = [
  { key: "live", label: "Live now" },
  { key: "contacts", label: "All contacts" }
] as const;

export type DashboardPeopleTab = (typeof PEOPLE_TABS)[number]["key"];

export function DashboardPeopleTabs({
  activeTab,
  onTabChange
}: {
  activeTab: DashboardPeopleTab;
  onTabChange?: (tab: DashboardPeopleTab) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
      {PEOPLE_TABS.map((tab) =>
        onTabChange ? (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={
              activeTab === tab.key
                ? "rounded-md bg-blue-50 px-4 py-2 text-blue-600"
                : "rounded-md px-4 py-2 text-slate-500"
            }
          >
            {tab.label}
          </button>
        ) : (
          <span
            key={tab.key}
            className={
              activeTab === tab.key
                ? "rounded-md bg-blue-50 px-4 py-2 text-blue-600"
                : "rounded-md px-4 py-2 text-slate-500"
            }
          >
            {tab.label}
          </span>
        )
      )}
    </div>
  );
}
