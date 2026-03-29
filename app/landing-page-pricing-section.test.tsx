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

import { LandingPricingSection } from "./landing-page-pricing-section";

describe("landing page pricing section", () => {
  it("renders starter and pro plan cards with the default pro team preview", () => {
    const html = renderToStaticMarkup(<LandingPricingSection />);

    expect(html).toContain("Simple, transparent pricing");
    expect(html).toContain("Choose the plan that&#x27;s right for you");
    expect(html).toContain("Free");
    expect(html).toContain("1 team member");
    expect(html).toContain("20 conversations per month");
    expect(html).toContain("Starter");
    expect(html).toContain("Pro");
    expect(html).toContain("Most Popular");
    expect(html).toContain("How many team members?");
    expect(html).toContain("4 team members");
    expect(html).toContain("$0");
    expect(html).toContain("$32");
    expect(html).toContain("/month");
    expect(html).toContain("$8 per user");
    expect(html).toContain("Get started free");
    expect(html).toContain("Start free trial");
    expect(html).toContain("Save 2 months");
    expect(html).toContain("No credit card required");
  });
});
