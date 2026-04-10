import { code, cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingWebhooksIntegrationGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "An HTTPS endpoint you control",
      "A backend or queue that can process webhook deliveries",
      "A signing secret if you want request verification"
    ]),
    paragraph("Webhook endpoints should acknowledge quickly and move heavier work into your own background job or queue.")
  ]),
  section("supported-events", "Supported events", [
    list([
      "`conversation.created`",
      "`conversation.resolved`",
      "`conversation.assigned`",
      "`message.received`",
      "`contact.created`",
      "`contact.updated`",
      "`tag.added`"
    ])
  ]),
  section("add-endpoint", "Add the webhook endpoint", [
    list([
      "Open `Settings → Integrations → Webhooks` in Chatting",
      "Add an HTTPS endpoint URL",
      "Choose which events to send",
      "Optionally add a signing secret",
      "Save the endpoint and run a test delivery"
    ], true),
    paragraph("Choose only the events your endpoint actually needs so the delivery stream stays easier to review.")
  ]),
  section("verify-signatures", "Verify signatures", [
    paragraph("If you save a secret, Chatting signs payloads so your backend can verify each request before processing it."),
    paragraph("Use the `X-Chatting-Signature` header and compare it with a signature you compute using the same secret."),
    code("POST /webhooks/chatting\nX-Chatting-Signature: <computed-signature>\nContent-Type: application/json", "http")
  ]),
  section("test-deliveries", "Test deliveries", [
    list([
      "Use the Test button after saving the endpoint",
      "Check the last response summary in Chatting",
      "Open the saved response body when a test fails",
      "Verify your endpoint returns quickly"
    ], true)
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Can we send webhooks to any URL?",
        answer: "Only to HTTPS endpoints. Chatting blocks insecure URLs during setup."
      },
      {
        question: "Do we have to use a signing secret?",
        answer: "No, but you should if the endpoint does anything important with customer or conversation data."
      },
      {
        question: "What should we do if a webhook test fails?",
        answer: "Use the saved response details in Chatting first, then confirm the endpoint URL, event selection, and signature verification logic."
      }
    ]),
    cta(
      "Need raw events in your backend?",
      "Open the Webhooks page in Chatting and add one HTTPS endpoint first.",
      "Open Chatting",
      "/login"
    )
  ])
];
