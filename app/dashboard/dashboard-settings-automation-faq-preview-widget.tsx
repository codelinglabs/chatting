import { AutomationHelpCircleIcon } from "./dashboard-settings-automation-faq-ui";

type PreviewMatch = {
  id: string;
  title: string;
  previewText: string;
  score: number;
};

export function AutomationFaqPreviewWidget({
  previewMessage,
  loading,
  matches,
  emptyMessage,
  fallbackMessage,
  brandColor,
  widgetTitle
}: {
  previewMessage: string;
  loading: boolean;
  matches: PreviewMatch[];
  emptyMessage: string;
  fallbackMessage: string;
  brandColor: string;
  widgetTitle: string;
}) {
  const softBrand = withAlpha(brandColor, 0.08);
  const ringBrand = withAlpha(brandColor, 0.16);
  const bubbleShadow = withAlpha(brandColor, 0.24);

  return (
    <div className="rounded-2xl border border-slate-200 px-6 py-6" style={{ background: `linear-gradient(135deg, ${softBrand} 0%, #ffffff 54%, #f8fafc 100%)` }}>
      <div className="mx-auto max-w-[320px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
        <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3 text-white" style={{ backgroundColor: brandColor }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>?</div>
          <div>
            <p className="text-sm font-semibold">{widgetTitle}</p>
            <p className="text-xs text-white/70">FAQ suggestions before handoff</p>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex justify-end">
            <div className="max-w-[240px] rounded-2xl rounded-br-md px-4 py-3 text-sm font-medium text-white" style={{ backgroundColor: brandColor, boxShadow: `0 10px 24px ${bubbleShadow}` }}>
              <p className="leading-6">{previewMessage}</p>
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3" style={{ boxShadow: `inset 0 0 0 1px ${softBrand}` }}>
            <div className="rounded-2xl bg-white/80 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Suggested help</p>
              <p className="mt-1 text-sm font-medium text-slate-700">While you wait, these might help:</p>
            </div>
            <div className="mt-3 space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 animate-pulse">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-4 w-36 rounded bg-slate-100" />
                          <div className="h-3 w-full rounded bg-slate-100" />
                        </div>
                        <div className="mt-1 h-4 w-4 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : matches.length ? matches.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm" style={{ boxShadow: `0 6px 16px ${softBrand}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: softBrand }}>
                        <AutomationHelpCircleIcon className="h-4 w-4" style={{ color: brandColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{item.previewText}</p>
                      </div>
                    </div>
                    <span className="shrink-0 pt-1 text-sm text-slate-400">→</span>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: softBrand }}>
                    <AutomationHelpCircleIcon className="h-5 w-5" style={{ color: brandColor }} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{emptyMessage}</p>
                </div>
              )}
            </div>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3" style={{ boxShadow: `0 6px 16px ${softBrand}` }}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Need more help?</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{fallbackMessage}</p>
              <div className="mt-3 inline-flex rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm" style={{ borderColor: ringBrand, backgroundColor: softBrand, color: brandColor }}>
                Talk to a human
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `rgba(37, 99, 235, ${alpha})`;
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
