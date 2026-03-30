import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

const referrals = {
  programs: [{ id: "program_1", code: "REF-123", label: "Customer referrals", programType: "customer", incentiveLabel: "1 free month", description: "desc", shareUrl: "https://chatting.example/signup?ref=REF-123" }],
  attributedSignups: [],
  rewards: [],
  pendingRewardCount: 0,
  earnedRewardCount: 0,
  earnedFreeMonths: 0,
  earnedDiscountCents: 0,
  earnedCommissionCents: 0
} as const;

describe("dashboard settings referrals card actions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("handles missing clipboard, successful copies, failed copies, and cleanup", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    const showToast = vi.fn();
    const captures: Record<string, unknown> = {};
    vi.doMock("react", () => reactMocks.moduleFactory());
    vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
    vi.doMock("./dashboard-settings-referrals-stats", () => ({ DashboardSettingsReferralStats: () => <div>stats</div> }));
    vi.doMock("./dashboard-settings-referrals-programs", () => ({
      DashboardSettingsReferralPrograms: (props: unknown) => ((captures.programs = props), <div>programs</div>)
    }));
    vi.doMock("./dashboard-settings-referrals-signups", () => ({
      DashboardSettingsReferralSignups: (props: unknown) => ((captures.signups = props), <div>signups</div>)
    }));
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(5), clearTimeout: vi.fn() });
    vi.stubGlobal("navigator", {} as Navigator);

    const module = await import("./dashboard-settings-billing-referrals-card");
    reactMocks.beginRender();
    renderToStaticMarkup(module.DashboardSettingsBillingReferralsCard({ referrals: referrals as never }));
    const cleanups = await runMockEffects(reactMocks.effects);

    await (captures.programs as { onCopy: (value: string, key: string, label: string) => Promise<void> }).onCopy("value", "program_1", "share link");
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } } as Navigator);
    await (captures.programs as { onCopy: (value: string, key: string, label: string) => Promise<void> }).onCopy("value", "program_1", "share link");
    reactMocks.beginRender();
    renderToStaticMarkup(module.DashboardSettingsBillingReferralsCard({ referrals: referrals as never }));
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("fail")) } } as Navigator);
    await (captures.programs as { onCopy: (value: string, key: string, label: string) => Promise<void> }).onCopy("value", "program_1", "share link");
    cleanups[0]?.();

    expect(showToast).toHaveBeenCalledWith("error", "Clipboard unavailable.", "Copy the share link manually for now.");
    expect(showToast).toHaveBeenCalledWith("success", "Copied to clipboard");
    expect(showToast).toHaveBeenCalledWith("error", "We couldn't copy that just now.", "Please try again in a moment.");
    expect((captures.programs as { copiedKey: string | null }).copiedKey).toBe("program_1");
    expect(globalThis.window.setTimeout).toHaveBeenCalled();
    expect(globalThis.window.clearTimeout).toHaveBeenCalled();
  });
});
