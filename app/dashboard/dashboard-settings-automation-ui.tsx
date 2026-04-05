"use client";

import { useId, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { classNames } from "@/lib/utils";
import { Button, ButtonLink } from "../components/ui/Button";
import { ChevronDownIcon } from "./dashboard-ui";
import { SettingsCard } from "./dashboard-settings-shared";

export function AutomationSectionCard({
  title,
  description,
  icon: Icon,
  children,
  actions,
  collapsible = true,
  defaultOpen = false
}: {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
  actions?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const toggleOpen = () => setIsOpen((current) => !current);

  return (
    <SettingsCard
      className="overflow-hidden p-0"
      actions={actions}
      title={undefined}
    >
      <div
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? isOpen : undefined}
        aria-controls={collapsible ? contentId : undefined}
        onClick={collapsible ? toggleOpen : undefined}
        onKeyDown={
          collapsible
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleOpen();
                }
              }
            : undefined
        }
        className={classNames(
          "flex items-start justify-between gap-4 px-6 py-5",
          collapsible && "cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100",
          isOpen && "border-b border-slate-200"
        )}
      >
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          {actions}
          {collapsible ? (
            <Button
              type="button"
              size="md"
              variant="secondary"
              aria-expanded={isOpen}
              aria-controls={contentId}
              trailingIcon={<ChevronDownIcon className={classNames("h-4 w-4 transition", isOpen && "rotate-180")} />}
              onClick={toggleOpen}
            >
              {isOpen ? "Collapse" : "Expand"}
            </Button>
          ) : null}
        </div>
      </div>
      {isOpen ? <div id={contentId} className="space-y-5 px-6 py-5">{children}</div> : null}
    </SettingsCard>
  );
}

export function AutomationFieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      {description ? <p className="mb-2 text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}

export function AutomationSelect({
  value,
  onChange,
  children
}: {
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function AutomationCheckbox({
  checked,
  label,
  description,
  onChange
}: {
  checked: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description ? <span className="mt-1 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

export function AutomationEmptyState({
  title,
  description,
  action,
  icon
}: {
  title: string;
  description: string;
  action: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
        {icon}
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}

export function AutomationUpgradeCard({
  title,
  description,
  actionLabel,
  actionHref = "/dashboard/settings?section=billing"
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-900">{title}</p>
          <p className="mt-1 text-sm text-amber-700">{description}</p>
        </div>
        <ButtonLink href={actionHref} size="md" variant="secondary" className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100">
          {actionLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
