import type { ContactSummary } from "@/lib/contact-types";
import { filterContacts, sortContacts } from "./dashboard-contacts-utils";

function createContact(overrides: Partial<ContactSummary> = {}): ContactSummary {
  return {
    id: "contact_1",
    siteId: "site_1",
    siteName: "Chatting",
    email: "tina@acme.com",
    name: "Tina Martinez",
    phone: null,
    company: "Acme",
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

describe("dashboard contacts utils", () => {
  it("filters contacts by search, status, tag, and custom field", () => {
    const contacts = [
      createContact(),
      createContact({
        id: "contact_2",
        name: "John Smith",
        email: "john@startup.io",
        company: "Startup",
        status: "lead",
        tags: ["pricing"],
        customFields: { plan: "Free" }
      })
    ];

    expect(filterContacts(contacts, "tina", { status: "", tag: "", lastSeen: "any", customFieldValues: {} })).toHaveLength(1);
    expect(filterContacts(contacts, "", { status: "lead", tag: "", lastSeen: "any", customFieldValues: {} })).toHaveLength(1);
    expect(filterContacts(contacts, "", { status: "", tag: "enterprise", lastSeen: "any", customFieldValues: {} })).toHaveLength(1);
    expect(filterContacts(contacts, "", { status: "", tag: "", lastSeen: "any", customFieldValues: { plan: "Pro" } })).toHaveLength(1);
  });

  it("sorts contacts by supported sort keys", () => {
    const contacts = [
      createContact({ id: "contact_1", name: "Zara", conversationCount: 1, lastSeenAt: "2026-04-03T10:00:00.000Z" }),
      createContact({ id: "contact_2", name: "Anna", conversationCount: 5, lastSeenAt: "2026-04-05T10:00:00.000Z" })
    ];

    expect(sortContacts(contacts, "nameAsc").map((contact) => contact.name)).toEqual(["Anna", "Zara"]);
    expect(sortContacts(contacts, "conversationsDesc").map((contact) => contact.id)).toEqual(["contact_2", "contact_1"]);
    expect(sortContacts(contacts, "lastSeenDesc").map((contact) => contact.id)).toEqual(["contact_2", "contact_1"]);
  });
});
