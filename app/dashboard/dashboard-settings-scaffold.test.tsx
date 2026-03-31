import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSettingsScaffold } from "./dashboard-settings-scaffold";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe("dashboard settings scaffold", () => {
  it("uses the full settings content width without the legacy inner max-width cap", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsScaffold
        activeSection="notifications"
        onSetActiveSection={() => {}}
        isDirty={false}
        isSaving={false}
        onDiscard={() => {}}
        onSave={() => {}}
      >
        <div>content</div>
      </DashboardSettingsScaffold>
    );

    expect(html).toContain("w-full space-y-6");
    expect(html).not.toContain("max-w-[860px]");
  });

  it("renders notices inside the same card shell as other settings content", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsScaffold
        activeSection="notifications"
        onSetActiveSection={() => {}}
        notice={{ tone: "success", message: "Settings saved" }}
        isDirty={false}
        isSaving={false}
        onDiscard={() => {}}
        onSave={() => {}}
      >
        <div>content</div>
      </DashboardSettingsScaffold>
    );

    expect(html).toContain("rounded-xl border border-slate-200 bg-white p-6");
    expect(html).toContain("Settings saved");
  });
});
