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

import SettingsLoading from "./loading";

describe("settings loading", () => {
  it("renders the static settings sidebar while the page content loads", () => {
    const html = renderToStaticMarkup(<SettingsLoading />);

    expect(html).toContain("Profile");
    expect(html).toContain("Notifications");
    expect(html).toContain("Email");
    expect(html).toContain("Plans &amp; Billing");
  });
});
