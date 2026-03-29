"use client";

import type { DashboardReferralProgram } from "@/lib/data";
import { classNames } from "@/lib/utils";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "./dashboard-ui";
import {
  referralProgramBadge,
  referralRewardToneClass,
  referralShareLinkLabel
} from "./dashboard-settings-referrals-helpers";

function CopyField({
  label,
  value,
  copied,
  onCopy,
  compact
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mb-4" : "mb-5"}>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{label}</p>
      <div className="flex h-10 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">
        <span
          className={classNames(
            "min-w-0 truncate font-mono text-sm text-slate-700",
            compact ? "font-medium tracking-[0.03em]" : "text-[13px] text-slate-600"
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className={classNames(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition",
            copied ? "bg-emerald-50 text-emerald-500" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          )}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ProgramCard({
  program,
  copiedKey,
  onCopy
}: {
  program: DashboardReferralProgram;
  copiedKey: string | null;
  onCopy: (value: string, key: string, label: string) => void;
}) {
  const badge = referralProgramBadge(program.programType);

  return (
    <article className="relative rounded-xl border border-slate-200 bg-white p-6 transition duration-150 hover:border-slate-300 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      {badge ? (
        <span className={classNames("absolute right-4 top-4 rounded-md px-2 py-1 text-[11px] font-medium", badge.className)}>
          {badge.label}
        </span>
      ) : null}

      <h4 className="font-serif text-[15px] font-semibold tracking-[-0.02em] text-slate-900">{program.label}</h4>
      <p className={classNames("mt-1 text-sm font-medium", referralRewardToneClass(program.programType))}>
        {program.incentiveLabel}
      </p>
      <p className="mb-5 mt-3 text-[13px] leading-6 text-slate-500">{program.description}</p>
      <div className="mb-5 h-px bg-slate-200" />

      <CopyField
        label="Code"
        value={program.code}
        copied={copiedKey === `${program.id}:code`}
        onCopy={() => onCopy(program.code, `${program.id}:code`, "referral code")}
        compact
      />
      <CopyField
        label="Share link"
        value={referralShareLinkLabel(program.shareUrl)}
        copied={copiedKey === `${program.id}:link`}
        onCopy={() => onCopy(program.shareUrl, `${program.id}:link`, "share link")}
      />

      <a
        href={program.shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-full items-center justify-center gap-3 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Open
        <ExternalLinkIcon className="h-4 w-4" />
      </a>
    </article>
  );
}

export function DashboardSettingsReferralPrograms({
  programs,
  copiedKey,
  onCopy
}: {
  programs: DashboardReferralProgram[];
  copiedKey: string | null;
  onCopy: (value: string, key: string, label: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          program={program}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}
