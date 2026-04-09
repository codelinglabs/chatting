import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import {
  CHATTING_ZAPIER_API_REFERENCE_PATH,
  CHATTING_ZAPIER_SETUP_GUIDE_PATH,
  CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH,
  CHATTING_ZAPIER_STARTER_WORKFLOWS
} from "@/lib/chatting-zapier-starter-workflows";

export const chattingZapierIntegrationGuideSections = [
  section("why", "Why teams use Zapier with Chatting", [
    paragraph("Zapier is the quickest way to move Chatting events into the rest of your stack without writing custom code. It works well when you want simple automations, lead routing, or spreadsheet logging built in a few minutes."),
    paragraph("Chatting exposes both triggers and actions, which means Zapier can react when something happens in Chatting or tell Chatting to create or update something on demand.")
  ]),
  section("available", "What Chatting supports in Zapier", [
    list([
      "Triggers: `New conversation`, `Conversation resolved`, `New contact`, `Tag added`",
      "Actions: `Create contact`, `Add tag to contact`, `Send message`"
    ]),
    paragraph("That gives you enough coverage to build common workflows like new-conversation alerts, contact syncing, and lightweight follow-up automation.")
  ]),
  section("connect", "How to connect Zapier", [
    list([
      "Open `Settings → Integrations → Zapier` in Chatting",
      "Copy the Chatting API key from the modal",
      "Open Chatting in Zapier from the same modal",
      "Paste the API key when Zapier asks for your Chatting account"
    ], true),
    paragraph("After the connection is saved, you can build Zaps using Chatting as either the trigger app or the action app."),
    paragraph(`For the deeper endpoint reference, keep the dedicated API docs nearby: \`${CHATTING_ZAPIER_API_REFERENCE_PATH}\`.`)
  ]),
  section("starter-workflows", "Starter workflows worth sharing", [
    list(
      CHATTING_ZAPIER_STARTER_WORKFLOWS.map(
        (workflow) =>
          `\`${workflow.name}\` — ${workflow.description} Build it with \`${workflow.recipe}\`.`
      )
    ),
    paragraph("These are the best first-use templates to put in help docs, onboarding emails, or an internal rollout note because each one proves the connection quickly without a heavy setup burden."),
    paragraph(`If you want the full starter-template list with copy-ready names and descriptions, open \`${CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH}\`.`)
  ]),
  section("help-docs", "What to publish in your own help docs", [
    list([
      `Link users to the setup walkthrough first: \`${CHATTING_ZAPIER_SETUP_GUIDE_PATH}\``,
      `Link users to the starter template list when they want examples: \`${CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH}\``,
      `Link reviewers and technical users to the endpoint reference: \`${CHATTING_ZAPIER_API_REFERENCE_PATH}\``,
      "Show one starter workflow for alerts, one for logging, and one for actions back into Chatting",
      "Give each workflow a plain-English result so users know what should happen after the Zap runs",
      "Tell users to test with one real Chatting conversation or contact before they turn the Zap on"
    ], true)
  ]),
  section("troubleshooting", "What to check when Zapier says reconnect", [
    paragraph("Zapier connections are API-key based in Chatting. If Zapier marks the account as expired or stale, reconnect the account in Zapier with the current Chatting API key."),
    paragraph("It is also worth retesting the trigger sample after you add or change a Zap so the mapped fields come from the latest sample data.")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do I need a developer to use the Zapier integration?",
        answer: "No. The Chatting side already exposes the trigger and action endpoints; most teams can connect it entirely through Zapier's builder."
      },
      {
        question: "Should I start with triggers or actions?",
        answer: "Start with one trigger first because it is the fastest proof that Chatting data is flowing correctly into Zapier."
      },
      {
        question: "Where do I get the Chatting API key?",
        answer: "Open `Settings → Integrations → Zapier` inside Chatting and copy the key shown there."
      }
    ]),
    cta(
      "Want your first Zap live today?",
      "Open the Zapier integration in Chatting, copy the API key, and start with a single `New conversation` trigger.",
      "Open Chatting",
      "/login"
    )
  ])
];
