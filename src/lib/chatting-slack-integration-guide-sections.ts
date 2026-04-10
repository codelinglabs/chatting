import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingSlackIntegrationGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "A Slack workspace where you can install or approve apps",
      "One channel for Chatting alerts",
      "A decision on whether your team should reply from Slack or use Slack for notifications only"
    ]),
    paragraph("Pick the first Slack channel before you connect the integration. Most teams start with one shared support or sales channel.")
  ]),
  section("connect-slack", "Connect Slack", [
    list([
      "Open `Settings → Integrations → Slack` in Chatting",
      "Start the Slack connection flow",
      "Authorize Chatting in Slack",
      "Choose the Slack channel where new conversations should land",
      "Save the integration settings"
    ], true),
    paragraph("After the connection is saved, Chatting keeps the workspace and channel settings so you can change them later.")
  ]),
  section("notifications", "Choose which notifications to send", [
    list([
      "New conversation notifications",
      "Conversations assigned to you",
      "Resolved conversations",
      "All new messages"
    ]),
    paragraph("Start with a narrow set first so the channel stays useful.")
  ]),
  section("reply-from-slack", "Reply from Slack", [
    paragraph("If Reply from Slack is enabled, teammates can answer from the Slack thread and send that message back to the visitor."),
    paragraph("If you keep Slack as notification-only, all replies stay in the Chatting dashboard.")
  ]),
  section("check-installation", "Check the installation", [
    list([
      "Start a new conversation from the widget or test page",
      "Confirm the alert appears in the Slack channel",
      "If Reply from Slack is enabled, send a reply from the Slack thread",
      "Confirm the visitor receives the reply in Chatting"
    ], true)
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Can we change the Slack channel later?",
        answer: "Yes. Open Slack settings in Chatting and choose a different channel whenever your workflow changes."
      },
      {
        question: "Do we have to allow replies from Slack?",
        answer: "No. You can keep Slack as a notification-only integration if you want replies to stay in the dashboard."
      },
      {
        question: "What should we do if Slack shows a reconnect state?",
        answer: "Reconnect the Slack account from Chatting so notifications and threaded replies can resume cleanly."
      }
    ]),
    cta(
      "Ready to connect Slack?",
      "Open the Slack integration in Chatting and connect one channel first.",
      "Open Chatting",
      "/login"
    )
  ])
];
