import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "http://localhost:3983"
}));

import HomePage from "./page";
import { metadata } from "./page";

describe("landing page", () => {
  it("renders the main marketing sections", () => {
    const html = renderToStaticMarkup(<HomePage />);
    const coreFeaturesIndex = html.lastIndexOf("The difference between a visitor and a customer is often one answer.");
    const everythingIncludedIndex = html.indexOf("Everything else included.");
    const comparisonIndex = html.indexOf("How we stack up.");

    expect(html).toContain("Live chat for");
    expect(html).toContain("small teams.");
    expect(html).toContain("See who&#x27;s on your site. Answer their questions. Close the deal. Simple pricing, no per-seat games.");
    expect(html).toContain("Questions about our plans?");
    expect(html).toContain("Do you offer monthly billing?");
    expect(html).toContain("Yes! All plans are month-to-month, cancel anytime.");
    expect(html).toContain("Start free");
    expect(html).toContain("See how it works");
    expect(html).not.toContain("What It Does");
    expect(html).toContain("The difference between a visitor and a customer is often one answer.");
    expect(html).toContain("pricing.yoursite.com");
    expect(html).toContain("inbox.chatting.app");
    expect(html).toContain("Questions about our plans?");
    expect(html).toContain("Just now");
    expect(html).not.toContain("Questions about setup?");
    expect(html).not.toContain("Can I add this to Shopify?");
    expect(html).not.toContain("Yep. Shopify takes about 5 minutes.");
    expect(html).toContain("Do you offer monthly billing?");
    expect(html).toContain("Yep. Plans are month-to-month.");
    expect(html).not.toContain("Talk to visitors right on your site.");
    expect(html).not.toContain("Keep the whole team in one thread.");
    expect(html).not.toContain("See who&#x27;s browsing in real time.");
    expect(html).not.toContain("Answer questions before they leave.");
    expect(html).not.toContain("Chatting is live chat that helps small teams convert more visitors into paying customers. See who&#x27;s on your site, answer their questions in real-time.");
    expect(html).not.toContain("Not a bloated &quot;customer platform.&quot; Not enterprise software with enterprise pricing. Just the tool you need to turn traffic into revenue.");
    expect(html).not.toContain("Your contact form is a conversion killer.");
    expect(html).not.toContain("67%");
    expect(html).toContain("How we stack up.");
    expect(html).not.toContain("The features that actually matter."); expect(html).toContain("This is all most teams need.");
    expect(html).toContain("Start chatting free");
    expect(html).toContain("Visitor Tracking");
    expect(html).toContain("Watch visitors browse in real-time. See what page they&#x27;re on, where they came from, how long they&#x27;ve been there. Spot high-intent prospects on your pricing page. Reach out before they leave.");
    expect(html).toContain("Team Inbox");
    expect(html).toContain("Every conversation in one place. Assign chats, tag them, search them. Keyboard shortcuts for speed. Nobody drops the ball.");
    expect(html).toContain("James Mitchell");
    expect(html).toContain("Sarah Kim");
    expect(html).toContain("Ryan Lopez");
    expect(html).toContain("Aisha Thompson");
    expect(html).toContain("Proactive Messages");
    expect(html).toContain("Don&#x27;t wait for visitors to reach out. Set automated messages on high-intent pages. Someone&#x27;s been on pricing for 30 seconds? &quot;Questions about our plans?&quot; You make the first move.");
    expect(html).toContain("On /pricing for 30+ seconds");
    expect(html).toContain("Questions about our plans?");
    expect(html).toContain("FAQ Suggestions");
    expect(html).toContain("Instant answers before the chat starts.");
    expect(html).toContain("Help &amp; Support");
    expect(html).toContain("Common questions");
    expect(html).toContain("How does billing work?");
    expect(html).toContain("Can I change my plan later?");
    expect(html).toContain("What payment methods do you accept?");
    expect(html).toContain("Still need help?");
    expect(html).toContain("Chat with our team");
    expect(html).toContain("Smart Routing");
    expect(html).toContain("Route conversations based on page URL, keywords, or visitor data. Pricing questions go to sales. Support issues go to support. No manual sorting.");
    expect(html).toContain("New chat");
    expect(html).toContain("Which<br/>");
    expect(html).toContain("page?");
    expect(html).toContain("Sales Team");
    expect(html).toContain("Support Team");
    expect(html).toContain("Offline Mode");
    expect(html).toContain("Set business hours. Show a custom offline message. Capture their email. Reply later — it goes straight to their inbox, and they can reply back into the chat.");
    expect(html).toContain("Contact History");
    expect(html).toContain("Chatting remembers visitors across sessions. See their full history — every page, every conversation, every visit. When someone comes back, you have context. Not &quot;Visitor #4827.&quot;");
    expect(html).toContain("Returning visitor");
    expect(html).toContain("This visit");
    expect(html).toContain("Pages viewed");
    expect(html).toContain("Previous chats");
    expect(html).toContain("View all");
    expect(html).not.toContain("Offline widget");
    expect(html).not.toContain("Capture the lead after hours");
    expect(html).not.toContain("Follow-up lands in their inbox");
    expect(html).toContain("Show relevant help articles before connecting to your team. Visitors get instant answers. You handle the complex stuff.");
    expect(html).toContain("Works with your stack.");
    expect(html).toContain("Slack");
    expect(html).toContain("Get notified in Slack. Reply from Slack. Never leave your workflow.");
    expect(html).toContain("#sales-alerts");
    expect(html).toContain("View in Chatting");
    expect(html).toContain("Reply in Slack");
    expect(html).toContain("Zapier");
    expect(html).toContain("Connect to 5,000+ apps. Push leads to your CRM. Trigger automations. No code.");
    expect(html).toContain("Create contact");
    expect(html).toContain("Webhooks");
    expect(html).toContain("Send events anywhere. Build custom integrations. Real-time.");
    expect(html).toContain("chat.started");
    expect(html).toContain("Shopify");
    expect(html).toContain("See order history in the chat sidebar. Know who you&#x27;re helping.");
    expect(html).toContain("Total spent: $847");
    expect(html).toContain("Everything else included.");
    expect(html).toContain("Widget Customization");
    expect(html).toContain("Your colors, your logo, your welcome message. Looks native.");
    expect(html).toContain("Analytics");
    expect(html).toContain("Response times, busiest hours, team performance, satisfaction scores.");
    expect(html).toContain("AI Assist");
    expect(html).toContain("Summarize threads, get reply suggestions, auto-tag conversations. AI helps — you decide.");
    expect(html).toContain("Saved Replies");
    expect(html).toContain("Common responses in one click. Stop retyping.");
    expect(html).toContain("File Sharing");
    expect(html).toContain("Screenshots, PDFs, invoices — right in the conversation.");
    expect(html).toContain("Team Management");
    expect(html).toContain("Invite teammates, assign roles, see who&#x27;s online.");
    expect(html).toContain("Email Fallback");
    expect(html).toContain("Visitor leaves? Conversation continues over email. They reply, it&#x27;s back in chat.");
    expect(html).toContain("Chatting is $20/month for up to 3 people. After that, $6/member. Simple.");
    expect(html).toContain("Compare");
    expect(html).toContain("Resources");
    expect(html).toContain('href="/guides"');
    expect(html).toContain("All comparisons");
    expect(html).toContain("Chatting vs Intercom");
    expect(html).toContain("Intercom alternatives");
    expect(html).toContain("Chatting vs Zendesk");
    expect(html).not.toContain("Chatting vs HubSpot Chat");
    expect(html).not.toContain("Chatting vs Crisp");
    expect(html).toContain('href="/blog?category=comparisons"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/blog/chatting-vs-intercom"');
    expect(html).toContain('href="/blog/intercom-alternatives-small-business"');
    expect(html).toContain('href="/blog/chatting-vs-zendesk"');
    expect(html).toContain("Add one snippet"); expect(html).toContain("Copy a line of code to your site. Works everywhere — WordPress, Webflow, Shopify, custom builds.");
    expect(html).toContain("Widget Settings"); expect(html).toContain("Visitor asks a question. You answer. They convert.");
    expect(html).toContain("Can teammates share one inbox?"); expect(html).toContain("No credit card. No sales call.");
    expect(html).toContain("Live in 3 minutes. Seriously.");
    expect(coreFeaturesIndex).toBeGreaterThan(-1);
    expect(everythingIncludedIndex).toBeGreaterThan(coreFeaturesIndex); expect(comparisonIndex).toBeGreaterThan(everythingIncludedIndex);
  });

  it("renders the sticky header with a mobile nav row", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("sticky top-0 z-50");
    expect(html).not.toContain("lg:fixed");
    expect(html).toContain("order-3 w-full overflow-x-auto");
    expect(html).toContain("Features");
    expect(html).toContain("Pricing");
    expect(html).toContain("How it works");
    expect(html).toContain("Blog");
    expect(html).toContain("Start 14 day free trial");
  });

  it("renders the install snippet using the public app url", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("http://localhost:3983/widget.js");
    expect(html).toContain("data-site-id=");
    expect(html).toContain("your-site-id");
  });
});
