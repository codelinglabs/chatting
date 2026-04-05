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

  it("renders desktop settings nav items with their shared descriptions", () => {
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

    expect(html).toContain("Notifications");
    expect(html).toContain("Alert preferences");
    expect(html).toContain("Reports");
    expect(html).toContain("Weekly report delivery");
  });

  it("uses one consistent desktop nav row footprint for settings items", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsScaffold
        activeSection="savedReplies"
        onSetActiveSection={() => {}}
        isDirty={false}
        isSaving={false}
        onDiscard={() => {}}
        onSave={() => {}}
      >
        <div>content</div>
      </DashboardSettingsScaffold>
    );

    expect(html).toContain("min-h-[76px]");
    expect(html).toContain("w-full items-start gap-3");
  });

  it("renders automation before notifications with saved replies directly after notifications", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsScaffold
        activeSection="automation"
        onSetActiveSection={() => {}}
        isDirty={false}
        isSaving={false}
        onDiscard={() => {}}
        onSave={() => {}}
      >
        <div>content</div>
      </DashboardSettingsScaffold>
    );

    expect(html.indexOf("Automation")).toBeLessThan(html.indexOf("Notifications"));
    expect(html.indexOf("Notifications")).toBeLessThan(html.indexOf("Saved replies"));
    expect(html).toContain("Integrations");
  });

  it("shows the unsaved marker on profile, automation, notifications, and email only", () => {
    const profileHtml = renderToStaticMarkup(
      <DashboardSettingsScaffold activeSection="profile" onSetActiveSection={() => {}} isDirty isSaving={false} onDiscard={() => {}} onSave={() => {}}>
        <div>content</div>
      </DashboardSettingsScaffold>
    );
    const emailHtml = renderToStaticMarkup(
      <DashboardSettingsScaffold activeSection="email" onSetActiveSection={() => {}} isDirty isSaving={false} onDiscard={() => {}} onSave={() => {}}>
        <div>content</div>
      </DashboardSettingsScaffold>
    );
    const reportsHtml = renderToStaticMarkup(
      <DashboardSettingsScaffold activeSection="reports" onSetActiveSection={() => {}} isDirty isSaving={false} onDiscard={() => {}} onSave={() => {}}>
        <div>content</div>
      </DashboardSettingsScaffold>
    );

    expect(profileHtml).toContain("Profile •");
    expect(emailHtml).toContain("Email •");
    expect(reportsHtml).not.toContain("Reports •");
  });

  it("does not render the legacy bottom save bar anymore", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsScaffold
        activeSection="notifications"
        onSetActiveSection={() => {}}
        isDirty
        isSaving
        onDiscard={() => {}}
        onSave={() => {}}
      >
        <div>content</div>
      </DashboardSettingsScaffold>
    );

    expect(html).not.toContain("Save changes");
    expect(html).not.toContain("Unsaved changes");
  });
});
