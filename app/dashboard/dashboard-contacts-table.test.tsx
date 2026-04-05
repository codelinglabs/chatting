import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ContactStatusDefinition, ContactSummary } from "@/lib/contact-types";
import { ContactsSkeleton, DashboardContactsTable } from "./dashboard-contacts-table";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as ReactElement;
  return [
    ...(predicate(element) ? [element] : []),
    ...collectElements(element.props?.children, predicate)
  ];
}

function createContact(overrides: Partial<ContactSummary> = {}): ContactSummary {
  return {
    id: "contact_1",
    siteId: "site_1",
    siteName: "Chatting",
    email: "tina@acme.com",
    name: "Tina Martinez",
    phone: null,
    company: "Acme Corp",
    role: "Product Manager",
    avatarUrl: null,
    status: "customer",
    tags: ["enterprise"],
    customFields: { plan: "Pro" },
    firstSeenAt: "2026-04-01T10:00:00.000Z",
    lastSeenAt: "2026-04-05T10:00:00.000Z",
    totalVisits: 4,
    totalPageViews: 12,
    conversationCount: 3,
    avgSessionSeconds: 120,
    location: { city: "San Francisco", region: "California", country: "US" },
    source: {
      firstLandingPage: "/pricing",
      referrer: "google.com",
      utmSource: "google",
      utmMedium: "organic",
      utmCampaign: null
    },
    latestConversationId: "conv_1",
    latestSessionId: "session_1",
    notes: [],
    pageHistory: [],
    ...overrides
  };
}

describe("dashboard contacts table", () => {
  it("renders a contacts-table skeleton that matches the live columns", () => {
    const html = renderToStaticMarkup(ContactsSkeleton());

    expect(html).toContain("Contact");
    expect(html).toContain("Status");
    expect(html).toContain("Last seen");
    expect(html).toContain("Convos");
    expect(html).toContain("Tags");
  });

  it("opens the contact from the row while keeping checkbox selection separate", () => {
    const statuses: ContactStatusDefinition[] = [
      { key: "customer", label: "Customer", color: "green" }
    ];
    const onOpenContact = vi.fn();
    const onToggleOne = vi.fn();
    const tree = DashboardContactsTable({
      contacts: [createContact()],
      statuses,
      selectedIds: [],
      safePage: 1,
      pageCount: 1,
      totalContacts: 1,
      onToggleAll: vi.fn(),
      onToggleOne,
      onOpenContact,
      onPreviousPage: vi.fn(),
      onNextPage: vi.fn()
    });
    const rows = collectElements(tree, (element) => element.type === "tr");
    const checkboxes = collectElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "checkbox"
    );

    expect(renderToStaticMarkup(tree)).toContain("Tina Martinez");
    rows[1]?.props.onClick();
    rows[1]?.props.onKeyDown({ key: "Enter", preventDefault: vi.fn() });
    checkboxes[1]?.props.onClick({ stopPropagation: vi.fn() });
    checkboxes[1]?.props.onKeyDown({ stopPropagation: vi.fn() });
    rows[1]?.props.onKeyDown({
      key: " ",
      target: { type: "checkbox" },
      currentTarget: { type: "row" },
      preventDefault: vi.fn()
    });
    checkboxes[1]?.props.onChange({ currentTarget: { checked: true } });

    expect(onOpenContact).toHaveBeenCalledTimes(2);
    expect(onOpenContact).toHaveBeenCalledWith("contact_1");
    expect(onToggleOne).toHaveBeenCalledWith("contact_1", true);
  });
});
