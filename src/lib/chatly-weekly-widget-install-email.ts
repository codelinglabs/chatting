import {
  joinEmailText,
  renderChattingEmailPage,
  renderParagraph,
  renderSmallText,
  renderStack,
  renderTextBlock
} from "@/lib/chatly-email-foundation";

type RenderedEmail = { subject: string; bodyText: string; bodyHtml: string };

export function renderWeeklyWidgetInstallEmail(input: {
  teamName: string;
  widgetUrl: string;
  settingsUrl: string;
}) {
  return {
    subject: `Install your widget to start getting weekly reports`,
    bodyText: joinEmailText([
      `${input.teamName} has not installed the Chatting widget yet.`,
      "Install the widget to start collecting conversations and unlock the weekly report.",
      `Install widget → ${input.widgetUrl}`,
      `Manage report settings → ${input.settingsUrl}`
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: "Install the widget to start collecting conversations and weekly reports.",
      title: "Install your widget",
      meta: input.teamName,
      sections: [
        {
          kind: "panel",
          html: renderStack(
            [
              renderTextBlock({
                html: "Your weekly report is ready as soon as the widget is live.",
                color: "#0F172A",
                fontSize: 22,
                lineHeight: "1.3",
                fontWeight: 600
              }),
              renderParagraph("Install the widget on your site so Chatting can capture conversations, response times, and page activity for the next Monday report."),
              renderSmallText("Once the widget is live, this report will switch from setup guidance to real performance data.")
            ],
            { gap: "12px" }
          ),
          padding: "0 32px 28px",
          panelBackground: "#FFFFFF"
        }
      ],
      actions: {
        primary: { href: input.widgetUrl, label: "Install Widget" },
        secondary: { href: input.settingsUrl, label: "Manage report settings" },
        padding: "0 32px 28px",
        borderTopColor: undefined
      }
    })
  } satisfies RenderedEmail;
}
