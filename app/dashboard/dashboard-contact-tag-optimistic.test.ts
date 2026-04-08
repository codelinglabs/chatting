import type { ContactDetail } from "@/lib/contact-types";
import {
  buildOptimisticContactTagAddition,
  buildOptimisticContactTagRemoval
} from "./dashboard-contact-tag-optimistic";

const detail: ContactDetail = {
  id: "contact_1",
  siteId: "site_1",
  siteName: "Chatting",
  email: "tina@acme.com",
  name: "Tina Martinez",
  phone: null,
  company: "Acme Corp",
  role: null,
  avatarUrl: null,
  status: "lead",
  tags: ["pricing"],
  customFields: {},
  firstSeenAt: "2026-04-01T10:00:00.000Z",
  lastSeenAt: "2026-04-05T10:00:00.000Z",
  totalVisits: 1,
  totalPageViews: 2,
  conversationCount: 1,
  avgSessionSeconds: 120,
  location: { city: null, region: null, country: null },
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
  conversations: []
};

describe("dashboard contact tag optimistic helpers", () => {
  it("adds a normalized optimistic tag without duplicating existing tags", () => {
    const nextDetail = buildOptimisticContactTagAddition(detail, "  VIP  ");

    expect(nextDetail).toMatchObject({ tags: ["pricing", "vip"] });
    expect(buildOptimisticContactTagAddition(nextDetail!, "vip")).toMatchObject({
      tags: ["pricing", "vip"]
    });
  });

  it("removes an optimistic tag immediately from the contact", () => {
    expect(buildOptimisticContactTagRemoval(detail, "pricing")).toMatchObject({
      tags: []
    });
  });
});
