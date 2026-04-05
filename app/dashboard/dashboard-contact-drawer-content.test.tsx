import { renderToStaticMarkup } from "react-dom/server";
import type { ContactDetail, ContactStatusDefinition } from "@/lib/contact-types";
import { DashboardContactDrawerContent } from "./dashboard-contact-drawer-content";

const statuses: ContactStatusDefinition[] = [
  { key: "lead", label: "Lead", color: "blue" },
  { key: "customer", label: "Customer", color: "green" }
];

const detail: ContactDetail = {
  id: "contact_1",
  siteId: "site_1",
  siteName: "Chatting",
  email: "tina@acme.com",
  name: "Tina Martinez",
  phone: "+14155550123",
  company: "Acme Corp",
  role: "Product Manager",
  avatarUrl: null,
  status: "customer",
  tags: ["enterprise-lead", "pricing-question"],
  customFields: { plan: "Pro", mrr: "49" },
  firstSeenAt: "2026-03-12T10:30:00.000Z",
  lastSeenAt: "2026-03-18T14:34:00.000Z",
  totalVisits: 8,
  totalPageViews: 47,
  conversationCount: 4,
  avgSessionSeconds: 204,
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
  notes: [
    {
      id: "note_1",
      body: "Interested in annual billing.",
      authorUserId: "user_1",
      authorName: "Sarah",
      createdAt: "2026-03-15T14:34:00.000Z",
      updatedAt: "2026-03-15T14:34:00.000Z"
    }
  ],
  pageHistory: [],
  conversations: [
    {
      id: "conv_1",
      title: "Question about enterprise pricing",
      status: "open",
      createdAt: "2026-03-15T14:34:00.000Z",
      assignedUserId: "user_1",
      messageCount: 4
    }
  ]
};

describe("dashboard contact drawer content", () => {
  it("renders the structured profile sections from the contact spec", () => {
    const html = renderToStaticMarkup(
      <DashboardContactDrawerContent
        detail={detail}
        conversations={detail.conversations}
        conversationsLoading={false}
        planKey="growth"
        statuses={statuses}
        customFields={[{ id: "field_1", key: "plan", label: "Plan", type: "dropdown", options: ["Free", "Pro"], prefix: null }]}
        tagOptions={["enterprise-lead"]}
        profileDraft={{ name: detail.name, phone: detail.phone ?? "", company: detail.company ?? "", role: detail.role ?? "" }}
        locationDraft={{ city: detail.location.city ?? "", region: detail.location.region ?? "", country: detail.location.country ?? "" }}
        customFieldDraft={detail.customFields}
        draftTag=""
        saving={false}
        onSavePatch={vi.fn(async () => {})}
        onSaveSettingsPatch={vi.fn(async () => true)}
        onProfileChange={vi.fn()}
        onLocationChange={vi.fn()}
        onCustomFieldChange={vi.fn()}
        onDraftTagChange={vi.fn()}
        onAddTag={vi.fn()}
        onLoadConversations={vi.fn(async () => {})}
        onEditNote={vi.fn()}
        onNavigateConversation={vi.fn()}
      />
    );
    const notesIndex = html.indexOf("Notes");
    const customFieldsIndex = html.indexOf("Custom fields");

    expect(html).toContain("Tina Martinez");
    expect(html).toContain("Acme Corp");
    expect(html).toContain("San Francisco");
    expect(html).toContain("Contact info");
    expect(html).toContain("Activity");
    expect(html).toContain("Custom fields");
    expect(html).toContain("Tags");
    expect(html).toContain("Notes");
    expect(html).toContain("Conversations");
    expect(html).toContain("Search or create tag...");
    expect(html).not.toContain("Question about enterprise pricing");
    expect(notesIndex).toBeGreaterThan(-1);
    expect(customFieldsIndex).toBeGreaterThan(notesIndex);
  });

  it("keeps the custom fields section visible with an empty-state message", () => {
    const html = renderToStaticMarkup(
      <DashboardContactDrawerContent
        detail={{ ...detail, customFields: {} }}
        conversations={detail.conversations}
        conversationsLoading={false}
        planKey="starter"
        statuses={statuses}
        customFields={[]}
        tagOptions={["enterprise-lead"]}
        profileDraft={{ name: detail.name, phone: detail.phone ?? "", company: detail.company ?? "", role: detail.role ?? "" }}
        locationDraft={{ city: detail.location.city ?? "", region: detail.location.region ?? "", country: detail.location.country ?? "" }}
        customFieldDraft={{}}
        draftTag=""
        saving={false}
        onSavePatch={vi.fn(async () => {})}
        onSaveSettingsPatch={vi.fn(async () => true)}
        onProfileChange={vi.fn()}
        onLocationChange={vi.fn()}
        onCustomFieldChange={vi.fn()}
        onDraftTagChange={vi.fn()}
        onAddTag={vi.fn()}
        onLoadConversations={vi.fn(async () => {})}
        onEditNote={vi.fn()}
        onNavigateConversation={vi.fn()}
      />
    );

    expect(html).toContain("Custom fields");
    expect(html).toContain("No custom fields configured yet.");
    expect(html).toContain("Add field");
  });
});
