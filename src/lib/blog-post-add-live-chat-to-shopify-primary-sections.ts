import { code, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const addLiveChatToShopifyPrimarySections = [
  section("why-your-store-needs-live-chat", "Why your Shopify store needs live chat", [
    paragraph("Let's do some quick math."),
    paragraph("Your store gets 1,000 visitors per month. Your conversion rate is 2.5%. That's 25 orders."),
    paragraph("But 975 people still left without buying. Why?"),
    paragraph("A lot of them are not bouncing because they hate the product. They're bouncing because they still have questions:"),
    list([
      "Does this fit true to size?",
      "Do you ship to Canada?",
      "What's your return policy?",
      "Is this compatible with my setup?",
      "Will it arrive by Friday?"
    ]),
    paragraph("Those are buying signals, not objections. Live chat gives shoppers an answer while they're still on your store instead of after they've already left."),
    paragraph("For many Shopify stores, that is the difference between \"just browsing\" and placing an order.")
  ]),
  section("how-to-add-live-chat", "How to add live chat to Shopify (5 minutes)", [
    paragraph("You don't need to install an app. You don't need a developer. You just need one small snippet."),
    paragraph("Step 1: Create your Chatting account."),
    list([
      "Use your store or team name",
      "Add your Shopify store URL",
      "Choose a brand color that matches your theme",
      "Set a welcome message like: \"Hey! Questions about our products?\""
    ]),
    paragraph("Step 2: Copy your install snippet."),
    code('<script src="https://usechatting.com/widget.js" data-site-id="YOUR_SITE_ID"></script>', "html"),
    paragraph("Step 3: Add it to Shopify."),
    list([
      "Log in to Shopify admin",
      "Go to Online Store → Themes",
      "Click Actions → Edit code on your current theme",
      "Open Layout → theme.liquid",
      "Find </head>",
      "Paste the snippet right before </head>",
      "Click Save"
    ], true),
    paragraph("Step 4: Test it in an incognito window. Open the chat bubble, send a message, and confirm it lands in your inbox.")
  ]),
  section("customizing-chat", "Customizing chat for your Shopify store", [
    paragraph("Once the widget is live, make it feel like part of the store instead of an awkward add-on."),
    list([
      "Color: match your Shopify theme's primary color",
      "Position: bottom-right works for most stores; use bottom-left if your cart lives on the right",
      "Team avatar: use your logo or a friendly team photo",
      "Welcome message: make it sound like your brand"
    ]),
    paragraph("Good Shopify welcome messages:"),
    quote("\"Hey! 👋 Questions about sizing or shipping? I'm here.\"\n\"Welcome to our store! Anything I can help you find?\"\n\"Need help choosing the right product? Happy to help.\""),
    paragraph("You can also add page-specific triggers so you're not waiting for visitors to open the widget themselves.")
  ]),
  section("what-to-say", "What to say: Shopify chat scripts", [
    paragraph("Saved replies make live chat faster and more consistent. You don't need to write from scratch every time."),
    paragraph("Greeting:"),
    quote("\"Hey! 👋 Thanks for stopping by. What brings you to the store today?\""),
    paragraph("Sizing question:"),
    quote("\"Great question. This one runs true to size for most people, but if you want, tell me what size you normally wear and I'll help you choose.\""),
    paragraph("Shipping question:"),
    quote("\"We ship to a lot of regions. If you tell me where you're located, I can give you the most accurate estimate.\""),
    paragraph("Return policy question:"),
    quote("\"Our return window is [X days]. If you want, I can send over the quick version and the full details.\""),
    paragraph("Someone is hesitating:"),
    quote("\"No pressure at all. Is there anything I can answer that would make the decision easier?\"")
  ]),
  section("proactive-chat-playbook", "The proactive chat playbook for Shopify", [
    paragraph("Waiting for visitors to start the chat means you miss a lot of high-intent moments."),
    paragraph("Product page after 45-60 seconds:"),
    quote("\"Questions about this product? Happy to help with sizing, materials, or anything else.\""),
    paragraph("Cart page after a short pause:"),
    quote("\"Almost ready to check out? Let me know if any questions came up before you place the order.\""),
    paragraph("Collections page after 60 seconds:"),
    quote("\"Looking for something specific? I can help you narrow it down.\""),
    paragraph("Shipping or returns page:"),
    quote("\"Questions about shipping or returns? I can point you to the quickest answer.\""),
    paragraph("One thoughtful proactive message is enough. The goal is to help, not stalk someone around the store.")
  ])
];
