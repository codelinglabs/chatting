import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingShopifyIntegrationGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "Your Shopify store domain in the form `your-store.myshopify.com`",
      "Permission to approve the app inside Shopify",
      "Visitor email addresses collected in Chatting so Shopify records can match"
    ]),
    paragraph("Chatting requests read access for Shopify customers and orders so the inbox can show useful context during a conversation.")
  ]),
  section("connect-shopify", "Connect Shopify", [
    list([
      "Open `Settings → Integrations → Shopify` in Chatting",
      "Enter the store slug or full `myshopify` domain",
      "Start the Shopify authorization flow",
      "Approve access in Shopify and return to Chatting"
    ], true),
    paragraph("After the connection succeeds, Chatting can look up Shopify customer context from the inbox.")
  ]),
  section("inbox-context", "What appears in the inbox", [
    list([
      "Customer profile details",
      "Recent orders",
      "Order totals and statuses",
      "A direct link back to the Shopify customer record"
    ]),
    paragraph("This context only appears when Chatting can match the conversation to a Shopify customer.")
  ]),
  section("check-installation", "Check the installation", [
    list([
      "Open a conversation with a matched customer email",
      "Confirm Shopify context appears in the inbox sidebar",
      "Open the linked customer record in Shopify",
      "Verify recent orders and totals match Shopify"
    ], true)
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do we need to enter the full Shopify URL?",
        answer: "No. You can enter the slug only and Chatting will normalize it into the full `your-store.myshopify.com` format."
      },
      {
        question: "Will every conversation show Shopify data?",
        answer: "No. Chatting needs a matching email address before it can pull Shopify customer context into the inbox."
      },
      {
        question: "What if the store connection fails?",
        answer: "Reconnect Shopify from Chatting and confirm the store domain is correct before retrying the authorization flow."
      }
    ]),
    cta(
      "Ready to connect Shopify?",
      "Open the Shopify integration in Chatting and start with your store domain.",
      "Open Chatting",
      "/login"
    )
  ])
];
