import type { ContactDetail } from "@/lib/contact-types";
import { addOptimisticContactNote, buildOptimisticContactNote } from "./dashboard-contact-note-optimistic";

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
  tags: [],
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
  notes: [
    {
      id: "note_1",
      body: "Existing note",
      authorUserId: "user_1",
      authorName: "Sarah",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T10:00:00.000Z"
    }
  ],
  pageHistory: [],
  conversations: []
};

describe("dashboard contact note optimistic helpers", () => {
  it("creates and inserts an optimistic contact note", () => {
    const note = buildOptimisticContactNote("  Follow up next week.  ", "2026-04-05T12:00:00.000Z");
    const nextDetail = addOptimisticContactNote(detail, "Follow up next week.", "2026-04-05T12:00:00.000Z");

    expect(note).toMatchObject({
      body: "Follow up next week.",
      authorUserId: "optimistic",
      authorName: "You",
      createdAt: "2026-04-05T12:00:00.000Z",
      updatedAt: "2026-04-05T12:00:00.000Z"
    });
    expect(note.id.startsWith("optimistic-contact-note-")).toBe(true);
    expect(nextDetail.notes[0]).toMatchObject({
      body: "Follow up next week.",
      authorName: "You"
    });
    expect(nextDetail.notes).toHaveLength(2);
    expect(nextDetail.notes[1]?.id).toBe("note_1");
  });
});
