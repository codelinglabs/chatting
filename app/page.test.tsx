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

describe("landing page", () => {
  it("renders the main marketing sections", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Live chat");
    expect(html).toContain("for small teams. No tickets. No enterprise bloat.");
    expect(html).toContain("Talk to visitors while they&#x27;re still deciding");
    expect(html).toContain("Operating hours, proactive chat, install verification, analytics exports, and weekly reports.");
    expect(html).toContain("Everything small teams actually need");
    expect(html).toContain("Capture the email, then keep the thread going");
    expect(html).toContain("Install, verify, and go live in minutes");
  });

  it("renders the sticky header with a mobile nav row", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("sticky top-0 z-50");
    expect(html).not.toContain("lg:fixed");
    expect(html).toContain("order-3 w-full overflow-x-auto");
    expect(html).toContain("Features");
    expect(html).toContain("Pricing");
    expect(html).toContain("How it works");
    expect(html).toContain("Free Tools");
    expect(html).toContain("Blog");
    expect(html).toContain("Start free");
  });

  it("renders the install snippet using the public app url", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("http://localhost:3983/widget.js");
    expect(html).toContain("data-site-id=&quot;your-site-id&quot;");
  });
});
