import { renderToStaticMarkup } from "react-dom/server";

const captures: Record<string, unknown> = {};

vi.mock("./settings-email-templates", () => ({
  SettingsEmailTemplates: (props: unknown) => ((captures.templates = props), <div>templates</div>)
}));

import { SettingsEmailSection } from "./dashboard-settings-email-billing-sections";
import { SettingsNotificationsSection } from "./dashboard-settings-notifications-section";
import { SettingsProfileSection } from "./dashboard-settings-profile-section";

describe("dashboard settings sections", () => {
  it("renders the profile section with avatar, personal info, and expanded password fields", () => {
    const html = renderToStaticMarkup(
      <SettingsProfileSection
        title="Profile"
        subtitle="Manage your details."
        profile={{
          firstName: "Tina",
          lastName: "Bauer",
          email: "tina@example.com",
          jobTitle: "Founder",
          avatarDataUrl: null
        } as never}
        teamName="Chatting Team"
        currentProfileName="Tina Bauer"
        fileInputRef={{ current: null }}
        passwordDraft={{ currentPassword: "", newPassword: "Hello123!", confirmPassword: "Hello123!" }}
        passwordExpanded
        passwordMeter={{ label: "Strong", widthClass: "w-full", toneClass: "bg-green-500" }}
        onUpdateProfile={() => {}}
        onUpdateTeamName={() => {}}
        onAvatarPick={() => {}}
        onSetPasswordExpanded={() => {}}
        onSetPasswordDraft={() => {}}
      />
    );

    expect(html).toContain("Upload photo");
    expect(html).toContain("Personal information");
    expect(html).toContain("Team identity");
    expect(html).toContain("Current password");
    expect(html).toContain("Strong");
  });

  it("renders notifications and email sections", () => {
    const html = renderToStaticMarkup(
      <>
        <SettingsNotificationsSection
          title="Notifications"
          subtitle="Control inbox alerts."
          notifications={{
            browserNotifications: true,
            soundAlerts: false,
            emailNotifications: true,
            newVisitorAlerts: true,
            highIntentAlerts: false
          } as never}
          onUpdateNotifications={() => {}}
        />
        <SettingsEmailSection
          title="Email"
          subtitle="Manage your email settings."
          email={{
            notificationEmail: "team@example.com",
            replyToEmail: "reply@example.com",
            emailSignature: "Best,\nTeam",
            templates: {}
          } as never}
          profileEmail="team@example.com"
          profileName="Team"
          profileAvatarDataUrl={null}
          showTranscriptBrandingPreview
          onUpdateEmail={() => {}}
          onNotice={() => {}}
        />
      </>
    );

    expect(html).toContain("Browser notifications");
    expect(html).toContain("High-intent alerts");
    expect(html).toContain("Notification email");
    expect(html).toContain("Reply-to address");
    expect(html).toContain("Email signature");
    expect(html).toContain("templates");
    expect(captures.templates).toMatchObject({
      notificationEmail: "team@example.com",
      replyToEmail: "reply@example.com",
      showTranscriptBrandingPreview: true
    });
  });
});
