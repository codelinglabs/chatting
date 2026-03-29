import { CheckIcon } from "./dashboard/dashboard-ui";

export function PricingFeature({ children }: { children: string }) {
  return (
    <li className="flex items-center gap-3 text-[15px] text-slate-600">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckIcon className="h-3 w-3" />
      </span>
      <span>{children}</span>
    </li>
  );
}

