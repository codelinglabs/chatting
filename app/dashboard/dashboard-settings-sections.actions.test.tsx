import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

describe("dashboard settings section actions", () => {
  it("updates profile fields, avatar actions, and password drafts", async () => {
    vi.resetModules();
    vi.doMock("./dashboard-settings-shared", () => ({
      SettingsCard: ({ actions, children }: { actions?: ReactNode; children: ReactNode }) => <section>{actions}{children}</section>,
      SettingsSectionHeader: ({ title }: { title: string }) => <div>{title}</div>
    }));
    const module = await import("./dashboard-settings-profile-section");
    const onUpdateProfile = vi.fn();
    const onAvatarPick = vi.fn();
    const onSetPasswordExpanded = vi.fn();
    const onSetPasswordDraft = vi.fn();
    const click = vi.fn();

    let tree = module.SettingsProfileSection({
      title: "Profile",
      subtitle: "Manage your details.",
      profile: { firstName: "Tina", lastName: "Bauer", email: "tina@example.com", jobTitle: "Founder", avatarDataUrl: null } as never,
      currentProfileName: "Tina Bauer",
      fileInputRef: { current: { click } } as never,
      passwordDraft: { currentPassword: "", newPassword: "", confirmPassword: "" },
      passwordExpanded: false,
      passwordMeter: { label: "Weak", widthClass: "w-1/4", toneClass: "bg-red-500" },
      onUpdateProfile,
      onAvatarPick,
      onSetPasswordExpanded,
      onSetPasswordDraft
    });

    const buttons = collectElements(tree, (element) => element.type === "button");
    const actionButton = collectElements(
      tree,
      (element) => typeof element.type === "function" && element.props.actions
    )[0]?.props.actions as ReactElement | undefined;
    buttons.find((element) => element.props["aria-label"] === "Change profile photo")?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Upload photo"))?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Remove"))?.props.onClick();
    actionButton?.props.onClick();
    const inputs = collectElements(tree, (element) => element.type === "input");
    inputs[1]?.props.onChange({ target: { value: "Tine" } });
    inputs[2]?.props.onChange({ target: { value: "Builder" } });
    inputs[3]?.props.onChange({ target: { value: "hello@example.com" } });
    inputs[4]?.props.onChange({ target: { value: "Support lead" } });
    inputs[0]?.props.onChange({ target: { files: ["avatar.png"] } });

    tree = module.SettingsProfileSection({
      title: "Profile",
      subtitle: "Manage your details.",
      profile: { firstName: "Tina", lastName: "Bauer", email: "tina@example.com", jobTitle: "Founder", avatarDataUrl: "data:image/png;base64,abc" } as never,
      currentProfileName: "Tina Bauer",
      fileInputRef: { current: { click } } as never,
      passwordDraft: { currentPassword: "", newPassword: "", confirmPassword: "" },
      passwordExpanded: true,
      passwordMeter: { label: "Strong", widthClass: "w-full", toneClass: "bg-green-500" },
      onUpdateProfile,
      onAvatarPick,
      onSetPasswordExpanded,
      onSetPasswordDraft
    });

    const passwordInputs = collectElements(tree, (element) => element.type === "input");
    passwordInputs.at(-3)?.props.onChange({ target: { value: "current-pass" } });
    passwordInputs.at(-2)?.props.onChange({ target: { value: "NextPass123!" } });
    passwordInputs.at(-1)?.props.onChange({ target: { value: "NextPass123!" } });

    expect(click).toHaveBeenCalledTimes(2);
    expect(onUpdateProfile).toHaveBeenCalledWith("avatarDataUrl", null);
    expect(onUpdateProfile).toHaveBeenCalledWith("firstName", "Tine");
    expect(onAvatarPick).toHaveBeenCalled();
    expect(onSetPasswordExpanded.mock.calls[0]?.[0](false)).toBe(true);
    expect(onSetPasswordDraft.mock.calls[0]?.[0]({ currentPassword: "", newPassword: "", confirmPassword: "" })).toMatchObject({ currentPassword: "current-pass" });
    expect(onSetPasswordDraft.mock.calls[1]?.[0]({ currentPassword: "", newPassword: "", confirmPassword: "" })).toMatchObject({ newPassword: "NextPass123!" });
    expect(onSetPasswordDraft.mock.calls[2]?.[0]({ currentPassword: "", newPassword: "", confirmPassword: "" })).toMatchObject({ confirmPassword: "NextPass123!" });
  });

  it("updates notification toggles and email settings fields", async () => {
    vi.resetModules();
    const captures: { rows: Array<Record<string, unknown>>; templates?: Record<string, unknown> } = { rows: [] };
    vi.doMock("./dashboard-settings-shared", () => ({
      SettingsCard: ({ children }: { children: ReactNode }) => <section>{children}</section>,
      SettingsSectionHeader: ({ title }: { title: string }) => <div>{title}</div>,
      ToggleRow: (props: Record<string, unknown>) => ((captures.rows.push(props), <div>row</div>))
    }));
    vi.doMock("./settings-email-templates", () => ({
      SettingsEmailTemplates: (props: Record<string, unknown>) => ((captures.templates = props), <div>templates</div>)
    }));
    const module = await import("./dashboard-settings-email-billing-sections");
    const notificationsModule = await import("./dashboard-settings-notifications-section");
    const onUpdateNotifications = vi.fn();
    const onUpdateEmail = vi.fn();

    renderToStaticMarkup(
      notificationsModule.SettingsNotificationsSection({
        title: "Notifications",
        subtitle: "Control alerts.",
        notifications: {
          browserNotifications: true,
          soundAlerts: false,
          emailNotifications: true,
          newVisitorAlerts: true,
          highIntentAlerts: false
        } as never,
        onUpdateNotifications
      })
    );
    captures.rows.forEach((row, index) => (row.onChange as (value: boolean) => void)(index % 2 === 0));

    const emailTree = module.SettingsEmailSection({
      title: "Email",
      subtitle: "Manage email settings.",
      email: {
        notificationEmail: "team@example.com",
        replyToEmail: "reply@example.com",
        emailSignature: "Best,\nTeam",
        templates: []
      } as never,
      profileEmail: "team@example.com",
      profileName: "Chatting",
      profileAvatarDataUrl: null,
      showTranscriptBrandingPreview: true,
      onUpdateEmail,
      onNotice: vi.fn()
    });
    renderToStaticMarkup(emailTree);

    const emailInputs = collectElements(emailTree, (element) => element.type === "input");
    emailInputs[0]?.props.onChange({ target: { value: "notify@example.com" } });
    emailInputs[1]?.props.onChange({ target: { value: "reply+new@example.com" } });
    collectElements(emailTree, (element) => element.type === "textarea")[0]?.props.onChange({ target: { value: "Cheers,\nChatting" } });
    (captures.templates?.onChange as (templates: unknown[]) => void)([{ key: "offline_reply" }]);

    expect(onUpdateNotifications).toHaveBeenCalledWith("browserNotifications", true);
    expect(onUpdateNotifications).toHaveBeenCalledWith("highIntentAlerts", true);
    expect(onUpdateEmail).toHaveBeenCalledWith("notificationEmail", "notify@example.com");
    expect(onUpdateEmail).toHaveBeenCalledWith("replyToEmail", "reply+new@example.com");
    expect(onUpdateEmail).toHaveBeenCalledWith("emailSignature", "Cheers,\nChatting");
    expect(onUpdateEmail).toHaveBeenCalledWith("templates", [{ key: "offline_reply" }]);
  });
});
