import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";
import { getDefaultDashboardEmailTemplates } from "@/lib/email-templates";

async function loadSettingsEmailTemplates() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const renderTranscript = vi.fn(() => ({ subject: "Transcript preview", bodyHtml: "<p>Transcript</p>" }));
  const renderVisitor = vi.fn(() => ({ subject: "Visitor preview", bodyHtml: "<p>Visitor</p>" }));

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("@/lib/conversation-feedback", () => ({ buildConversationFeedbackLinks: vi.fn(() => ({ good: "#" })) }));
  vi.doMock("@/lib/conversation-transcript-email", () => ({
    buildConversationTranscriptPreviewMessages: vi.fn(() => []),
    renderConversationTranscriptEmailTemplate: renderTranscript
  }));
  vi.doMock("@/lib/conversation-visitor-email", () => ({
    renderVisitorConversationEmailTemplate: renderVisitor
  }));
  vi.doMock("./settings-email-template-ui", () => ({
    replaceTemplate: (templates: Array<{ key: string }>, nextTemplate: { key: string }) =>
      templates.map((template) => (template.key === nextTemplate.key ? nextTemplate : template)),
    SettingsEmailTemplateList: (props: unknown) => ((captures.list = props), <div>list</div>),
    SettingsEmailTemplateEditor: (props: unknown) => ((captures.editor = props), <div>editor</div>)
  }));

  const module = await import("./settings-email-templates");
  return { SettingsEmailTemplates: module.SettingsEmailTemplates, reactMocks, captures, renderTranscript, renderVisitor };
}

describe("settings email templates more", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders transcript and visitor preview branches and toggles template menus", async () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => callback(0),
      location: { origin: "https://app.usechatting.com" }
    });

    const { SettingsEmailTemplates, reactMocks, captures, renderTranscript, renderVisitor } = await loadSettingsEmailTemplates();
    const templates = getDefaultDashboardEmailTemplates();
    const props = {
      templates,
      notificationEmail: "team@example.com",
      replyToEmail: "",
      profileEmail: "profile@example.com",
      profileName: "Tina Bauer",
      profileAvatarDataUrl: null,
      showTranscriptBrandingPreview: true,
      onChange: vi.fn(),
      onNotice: vi.fn()
    };

    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    await runMockEffects(reactMocks.effects);

    (captures.list as { onToggleMenu: (key: string) => void }).onToggleMenu("offline_reply");
    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    expect((captures.list as { menuTemplateKey: string | null }).menuTemplateKey).toBe("offline_reply");

    (captures.list as { onOpenTemplateEditor: (template: (typeof templates)[0]) => void }).onOpenTemplateEditor(
      templates.find((template) => template.key === "conversation_transcript")!
    );
    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    expect(renderTranscript).toHaveBeenCalledWith(
      expect.objectContaining({ key: "conversation_transcript" }),
      expect.any(Object),
      expect.objectContaining({ replyToEmail: "profile@example.com", showViralFooter: true })
    );

    (captures.list as { onOpenTemplateEditor: (template: (typeof templates)[0]) => void }).onOpenTemplateEditor(
      templates.find((template) => template.key === "offline_reply")!
    );
    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    expect(renderVisitor).toHaveBeenCalledWith(
      expect.objectContaining({ key: "offline_reply" }),
      expect.any(Object),
      expect.objectContaining({ replyToEmail: "profile@example.com", showViralFooter: true })
    );
  });

  it("guards duplicate test sends and ignores missing reset targets", async () => {
    let resolveFetch: (() => void) | null = null;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = () => resolve({ ok: true, json: async () => ({ ok: true }) } as Response);
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => callback(0),
      location: { origin: "https://app.usechatting.com" }
    });

    const { SettingsEmailTemplates, reactMocks, captures } = await loadSettingsEmailTemplates();
    const onChange = vi.fn();
    const onNotice = vi.fn();
    const templates = getDefaultDashboardEmailTemplates();
    const props = {
      templates,
      notificationEmail: "team@example.com",
      replyToEmail: "reply@example.com",
      profileEmail: "profile@example.com",
      profileName: "Tina Bauer",
      profileAvatarDataUrl: null,
      showTranscriptBrandingPreview: false,
      onChange,
      onNotice
    };

    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    (captures.list as { onResetTemplate: (key: string) => void }).onResetTemplate("missing" as never);
    (captures.list as { onSendTest: (template: { key: string; subject: string; body: string }) => void }).onSendTest(templates[0]);
    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    (captures.list as { onSendTest: (template: { key: string; subject: string; body: string }) => void }).onSendTest(templates[0]);
    resolveFetch?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(onChange).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onNotice).toHaveBeenCalledWith({ tone: "success", message: "Sent a test email to team@example.com" });
  });
});
