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

    expect(html).toContain("Talk to your visitors.");
    expect(html).toContain("Not at them.");
    expect(html).toContain("Trusted by 2,400+ teams");
    expect(html).toContain("Your visitors have questions. Right now.");
    expect(html).toContain("Teams who switched never looked back");
    expect(html).toContain("Simple, transparent pricing");
    expect(html).toContain("Your next customer is on your site right now.");
  });

  it("renders the install snippet using the public app url", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("http://localhost:3983/widget.js");
    expect(html).toContain("data-site-id=&quot;your-site-id&quot;");
  });
});
