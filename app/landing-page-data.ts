import { getPublicAppUrl } from "@/lib/env";

export function codeSnippet() {
  const appUrl = getPublicAppUrl();

  return `<script
  src="${appUrl}/widget.js"
  data-site-id="your-site-id"
></script>`;
}

export const testimonials = [
  {
    initials: "M",
    name: "Marc",
    quote:
      "We used to lose 30% of our pricing page visitors. Now we catch them right when they're deciding. Chatting paid for itself in the first week."
  },
  {
    initials: "R",
    name: "Rupert",
    quote:
      "Finally, live chat that doesn't feel like enterprise software. My team was productive on day one."
  },
  {
    initials: "E",
    name: "Eliana",
    quote:
      "The visitor page is magic. Seeing someone read our docs for 10 minutes then land on pricing? That's when you reach out."
  }
];

export const setupSteps = [
  {
    number: "1",
    title: "Add one snippet",
    body: "Copy a line of code to your site. Works everywhere — WordPress, Webflow, Shopify, custom builds."
  },
  {
    number: "2",
    title: "Customize",
    body: "Your colors, your message. Or skip it."
  },
  {
    number: "3",
    title: "Start talking",
    body: "Visitor asks a question. You answer. They convert."
  }
];

export const stats = [
  { value: "1.2m", label: "Average response time" },
  { value: "94%", label: "Resolution rate" },
  { value: "4.8/5", label: "Satisfaction score" },
  { value: "2,400+", label: "Happy teams" }
];
