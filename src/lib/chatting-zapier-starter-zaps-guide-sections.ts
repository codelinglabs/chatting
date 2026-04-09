import { cta, list, paragraph, section } from "@/lib/blog-block-factories";
import {
  CHATTING_ZAPIER_SETUP_GUIDE_PATH,
  CHATTING_ZAPIER_STARTER_WORKFLOWS
} from "@/lib/chatting-zapier-starter-workflows";

const workflowSections = CHATTING_ZAPIER_STARTER_WORKFLOWS.map((workflow) =>
  section(workflow.id, workflow.name, [
    paragraph(workflow.description),
    list([
      `Template name: \`${workflow.templateName}\``,
      `Template description: ${workflow.templateDescription}`,
      `Build with: \`${workflow.recipe}\``
    ])
  ])
);

export const chattingZapierStarterZapsGuideSections = [
  section("overview", "What to publish first", [
    paragraph("If you want Chatting and Zapier adoption to grow after launch, start by publishing a few narrow starter Zaps that solve one clear problem each. The best ones help teams spot new conversations quickly, log new contacts, import leads, or send a first reply without writing extra backend glue."),
    paragraph("These starter workflows are written so you can reuse the same names and one-line summaries in docs, onboarding emails, in-app callouts, and future Zap template listings.")
  ]),
  ...workflowSections,
  section("sharing", "How to share these starter Zaps", [
    list([
      "Start with one alert workflow, one logging workflow, and one action workflow so users can choose a clear first win",
      "Use the template names exactly as written so docs, screenshots, and future Zapier templates stay consistent",
      "Link back to the main setup guide before the list so users connect Chatting first",
      "Tell users to test with one real conversation or contact before they turn the Zap on"
    ], true),
    cta(
      "Need the connection steps too?",
      "Open the main Zapier setup guide first, then come back here to choose the best starter workflow for your team.",
      "Open setup guide",
      CHATTING_ZAPIER_SETUP_GUIDE_PATH
    )
  ])
];
