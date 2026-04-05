import type { ContactSummary } from "@/lib/contact-types";
import {
  diffContactTags,
  getAddedContactNotes,
  getChangedContactProfileFields,
  getContactMergeMetadata,
  normalizeExportFieldKeys
} from "./contact-event-utils";

function createContact(overrides: Partial<ContactSummary> = {}): ContactSummary {
  return {
    id: "contact_1",
    siteId: "site_1",
    siteName: "Chatting",
    email: "tina@acme.com",
    name: "Tina",
    phone: null,
    company: null,
    role: null,
    avatarUrl: null,
    status: "lead",
    tags: [],
    customFields: {},
    firstSeenAt: "2026-04-05T10:00:00.000Z",
    lastSeenAt: "2026-04-05T10:00:00.000Z",
    totalVisits: 1,
    totalPageViews: 1,
    conversationCount: 1,
    avgSessionSeconds: 30,
    location: { city: null, region: null, country: null },
    source: {
      firstLandingPage: null,
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null
    },
    latestConversationId: null,
    latestSessionId: null,
    notes: [],
    pageHistory: [],
    ...overrides
  };
}

describe("contact event utils", () => {
  it("detects changed contact profile fields", () => {
    const before = createContact();
    const after = createContact({
      company: "Acme",
      location: { city: "San Francisco", region: "California", country: "US" },
      customFields: { plan: "Pro" }
    });

    expect(getChangedContactProfileFields(before, after)).toEqual([
      "company",
      "location",
      "customFields.plan"
    ]);
  });

  it("diffs added and removed tags", () => {
    expect(diffContactTags(["enterprise", "vip"], ["vip", "billing", "enterprise-plus"])).toEqual({
      added: ["billing", "enterprise-plus"],
      removed: ["enterprise"]
    });
  });

  it("finds newly added notes", () => {
    const before = createContact({
      notes: [{
        id: "note_1",
        body: "Old",
        authorUserId: "user_1",
        authorName: "Tina",
        createdAt: "2026-04-05T10:00:00.000Z",
        updatedAt: "2026-04-05T10:00:00.000Z"
      }]
    });
    const after = createContact({
      notes: [
        {
          id: "note_2",
          body: "New",
          authorUserId: "user_2",
          authorName: "Alex",
          createdAt: "2026-04-05T11:00:00.000Z",
          updatedAt: "2026-04-05T11:00:00.000Z"
        },
        ...before.notes
      ]
    });

    expect(getAddedContactNotes(before.notes, after.notes).map((note) => note.id)).toEqual(["note_2"]);
  });

  it("returns merge metadata only when a new session or conversation is linked", () => {
    expect(getContactMergeMetadata(
      { latestSessionId: "session_1", latestConversationId: "conv_1" },
      { latestSessionId: "session_2", latestConversationId: "conv_1" }
    )).toEqual({
      previousSessionId: "session_1",
      sessionId: "session_2",
      previousConversationId: "conv_1",
      conversationId: "conv_1"
    });

    expect(getContactMergeMetadata(
      { latestSessionId: "session_1", latestConversationId: "conv_1" },
      { latestSessionId: "session_1", latestConversationId: "conv_1" }
    )).toBeNull();
  });

  it("normalizes export field keys", () => {
    expect(normalizeExportFieldKeys([" email ", "status", "email", ""])).toEqual(["email", "status"]);
  });
});
