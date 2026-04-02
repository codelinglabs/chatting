import { code, list, paragraph, quote, section } from "@/lib/blog-block-factories";

export const wordpressLiveChatSetupPrimarySections = [
  section("dilemma", "The WordPress live chat dilemma", [
    paragraph("Search for a WordPress live chat plugin and you get a wall of options: abandoned plugins, complicated setups, and tools that try to take over your whole site."),
    paragraph("The good news is you usually do not need a plugin at all. Most live chat tools work by loading one JavaScript snippet in your site header."),
    paragraph("That means no plugin maintenance, fewer compatibility headaches, and a setup that works with almost any WordPress theme.")
  ]),
  section("two-ways", "Two ways to add live chat to WordPress", [
    paragraph("Option A: add a code snippet directly. This is the cleanest approach and usually the best one."),
    paragraph("Option B: use a simple code-injection plugin if you do not want to touch theme files."),
    paragraph("Both take about five minutes. Option A just leaves you with one less plugin to babysit.")
  ]),
  section("prerequisites", "Prerequisites", [
    list([
      "A WordPress site, either self-hosted or a WordPress.com plan that supports custom code",
      "Admin access to your dashboard",
      "A Chatting account to generate the widget snippet"
    ]),
    paragraph("As of April 2026, WordPress.com only allows full JavaScript installs on plugin-enabled plans, so check your current plan before you start.")
  ]),
  section("step-by-step", "Step-by-step setup", [
    paragraph("Step 1: create your Chatting account."),
    list([
      "Add your site URL",
      "Pick a team name for the widget header",
      "Choose a brand color that matches your theme",
      "Set a welcome message such as: \"Hi! How can I help you today?\""
    ]),
    paragraph("Step 2: copy your install snippet."),
    code('<script src="https://usechatting.com/widget.js" data-site-id="YOUR_SITE_ID"></script>', "html"),
    paragraph("Step 3: add it to WordPress with one of these methods."),
    paragraph("Method 1: use your theme's custom code area if it has one."),
    list([
      "Go to Appearance → Customize",
      "Look for Custom Code, Header Scripts, or a similar theme setting",
      "Paste the snippet into the header area",
      "Publish the change"
    ], true),
    paragraph("Method 2: edit header.php if your theme still exposes it."),
    list([
      "Go to Appearance → Theme File Editor",
      "Open header.php",
      "Find </head>",
      "Paste the snippet immediately before </head>",
      "Save the file"
    ], true),
    paragraph("If you edit theme files directly, remember that a theme update can overwrite the change unless you are using a child theme.")
  ]),
  section("plugin-option", "Option B: use a simple code snippets plugin", [
    paragraph("If you would rather avoid theme files entirely, use a minimal code-injection plugin such as WPCode."),
    list([
      "Install and activate a header or code snippets plugin",
      "Create a new HTML snippet",
      "Paste the Chatting install code",
      "Set it to load site-wide in the header",
      "Save and activate it"
    ], true),
    paragraph("Same result, slightly more plugin overhead.")
  ]),
  section("verify-customize", "Verify it and make it feel native", [
    list([
      "Open your site in an incognito window",
      "Confirm the chat bubble appears",
      "Send a test message",
      "Check that the message lands in your Chatting inbox"
    ], true),
    paragraph("Then customize the basics so the widget feels like part of the site instead of an afterthought."),
    list([
      "Color: match your theme's primary color",
      "Position: bottom-right for most sites, bottom-left if your layout is crowded",
      "Avatar: use your logo or a friendly team photo",
      "Welcome message: write it in the same voice as the rest of your site"
    ]),
    paragraph("A few starter prompts that work well on WordPress sites:"),
    quote("\"Enjoying the article? I can help if a question came up.\"\n\"Questions about our services or pricing? Happy to help.\"\n\"Rather chat than fill out a form? Go ahead.\"")
  ])
];
