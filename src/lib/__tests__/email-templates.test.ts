import {
  buildDashboardEmailTemplatePreviewContext,
  renderDashboardEmailTemplate
} from "@/lib/email-templates";

describe("email templates", () => {
  const previewContext = buildDashboardEmailTemplatePreviewContext({
    profileEmail: "sarah@chatly.example",
    profileName: "Sarah Chen"
  });

  it("renders the shared styled email shell when requested", () => {
    const rendered = renderDashboardEmailTemplate(
      {
        subject: "Hello {{visitor_name}}",
        body: "Thanks for reaching out to **{{team_name}}**."
      },
      previewContext,
      {
        includeShell: true
      }
    );

    expect(rendered.subject).toBe("Hello Alex");
    expect(rendered.bodyText).toContain("Thanks for reaching out to **Chatting Team**.");
    expect(rendered.bodyHtml).toContain("max-width:640px");
    expect(rendered.bodyHtml).toContain("<strong>Chatting Team</strong>");
  });

  it("renders shared supplemental sections into both html and text output", () => {
    const rendered = renderDashboardEmailTemplate(
      {
        subject: "Checking in",
        body: "Hi {{visitor_name}},"
      },
      previewContext,
      {
        includeShell: true,
        sections: [
          {
            type: "plain",
            tone: "soft",
            text: "Best,\nChatting Team",
            html: "Best,<br />Chatting Team"
          },
          {
            type: "actions",
            title: "Helpful?",
            textTitle: "Helpful?",
            links: [
              { label: "Yes", href: "https://chatly.example/yes" },
              { label: "No", href: "https://chatly.example/no" }
            ]
          }
        ]
      }
    );

    expect(rendered.bodyText).toContain("Best,\nChatting Team");
    expect(rendered.bodyText).toContain("Helpful?");
    expect(rendered.bodyText).toContain("Yes: https://chatly.example/yes");
    expect(rendered.bodyHtml).toContain("Best,<br />Chatting Team");
    expect(rendered.bodyHtml).toContain('href="https://chatly.example/yes"');
    expect(rendered.bodyHtml).toContain(">Helpful?</p>");
  });
});
