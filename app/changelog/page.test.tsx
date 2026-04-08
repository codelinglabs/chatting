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
  getPublicAppUrl: () => "https://usechatting.com"
}));

import ChangelogPage from "./page";

describe("changelog page", () => {
  it("renders the changelog entries and shared footer", () => {
    const html = renderToStaticMarkup(<ChangelogPage />);

    expect(html).toContain("Changelog");
    expect(html).toContain("Reporting now matches each teammate");
    expect(html).toContain("Conversation emails now bring visitors back into the same thread");
    expect(html).toContain("Joining your team got easier");
    expect(html).toContain("Upgrading got clearer for growing teams");
    expect(html).toContain("Chatting launched with the essentials for live chat");
    expect(html).toContain("Live chat for small teams.");
    expect(html).toContain("/changelog");
  });
});
