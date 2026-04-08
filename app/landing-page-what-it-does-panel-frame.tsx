import type { ReactNode } from "react";

export function LandingWhatItDoesPanelFrame({
  address,
  className,
  children
}: {
  address: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={`overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur ${className ?? ""}`}>
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/95 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-300" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-300" />
        <div className="ml-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-400">
          {address}
        </div>
      </div>
      <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-4">{children}</div>
    </article>
  );
}
