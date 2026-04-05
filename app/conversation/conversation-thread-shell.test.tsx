import { renderToStaticMarkup } from "react-dom/server";
import { ConversationThreadShell } from "./conversation-thread-shell";

describe("conversation thread shell", () => {
  const baseProps = {
    brandingLabel: "Chatting",
    brandingUrl: "https://usechatting.com",
    brandColor: "#2563EB",
    content: "",
    messages: [],
    onChangeContent: vi.fn(),
    onSubmit: vi.fn(),
    sending: false,
    showBranding: false,
    teamPhotoUrl: null,
    widgetTitle: "Support"
  } as const;

  it("renders selected attachments and allows attachment-only sends", () => {
    const html = renderToStaticMarkup(
      <ConversationThreadShell
        {...baseProps}
        allowAttachments
        attachments={[{ name: "brief.pdf" } as File]}
        onAddAttachments={vi.fn()}
        onRemoveAttachment={vi.fn()}
      />
    );

    expect(html).toContain("brief.pdf");
    expect(html).toContain("Up to 3 files");
    expect(html).not.toContain('type="submit" disabled=""');
  });

  it("keeps the attachment controls hidden when uploads are disabled", () => {
    const html = renderToStaticMarkup(<ConversationThreadShell {...baseProps} />);

    expect(html).not.toContain("Up to 3 files");
    expect(html).toContain('type="submit" disabled=""');
  });
});
