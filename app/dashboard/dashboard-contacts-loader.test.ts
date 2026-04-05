import type { ContactListPayload } from "@/lib/contact-types";
import {
  getCachedContactsPayload,
  loadContactsPayload,
  replaceCachedContact,
  replaceCachedContactSettings,
  resetContactsPayloadCache
} from "./dashboard-contacts-loader";

const payload: ContactListPayload = {
  contacts: [
    {
      id: "contact_1",
      siteId: "site_1",
      siteName: "Chatting",
      email: "tina@letterflow.so",
      name: "Tina",
      phone: null,
      company: "Letterflow",
      role: null,
      avatarUrl: null,
      status: "customer",
      tags: ["enterprise"],
      customFields: {},
      firstSeenAt: "2026-04-01T10:00:00.000Z",
      lastSeenAt: "2026-04-05T10:00:00.000Z",
      totalVisits: 1,
      totalPageViews: 2,
      conversationCount: 3,
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
      pageHistory: []
    }
  ],
  settings: {
    statuses: [{ key: "customer", label: "Customer", color: "green" }],
    customFields: [],
    dataRetention: "forever"
  },
  planKey: "growth",
  limits: {
    fullProfiles: true,
    exportEnabled: true,
    apiEnabled: true,
    customStatusesLimit: null,
    customFieldsLimit: null
  },
  tagOptions: ["enterprise"]
};

describe("dashboard contacts loader", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetContactsPayloadCache();
  });

  it("reuses one inflight request for concurrent loads", async () => {
    let resolveResponse: ((value: { ok: boolean; json: () => Promise<ContactListPayload> }) => void) | null = null;
    const fetchMock = vi.fn().mockReturnValue(new Promise((resolve) => {
      resolveResponse = resolve;
    }));
    vi.stubGlobal("fetch", fetchMock);

    const first = loadContactsPayload();
    const second = loadContactsPayload();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveResponse?.({
      ok: true,
      json: async () => payload
    });

    await expect(first).resolves.toEqual(payload);
    await expect(second).resolves.toEqual(payload);
  });

  it("updates the cached contact in place", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload
    }));

    await loadContactsPayload();
    replaceCachedContact({
      ...payload.contacts[0],
      name: "Tina Martinez"
    });

    expect(getCachedContactsPayload()?.contacts[0]?.name).toBe("Tina Martinez");
  });

  it("updates cached contact settings in place", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload
    }));

    await loadContactsPayload();
    replaceCachedContactSettings({
      statuses: [{ key: "vip", label: "VIP", color: "amber" }],
      customFields: [
        {
          id: "field_1",
          key: "plan",
          label: "Plan",
          type: "dropdown",
          options: ["Free", "Pro"],
          prefix: null
        }
      ],
      planKey: "growth"
    });

    expect(getCachedContactsPayload()?.settings.statuses).toEqual([
      { key: "vip", label: "VIP", color: "amber" }
    ]);
    expect(getCachedContactsPayload()?.settings.customFields).toEqual([
      {
        id: "field_1",
        key: "plan",
        label: "Plan",
        type: "dropdown",
        options: ["Free", "Pro"],
        prefix: null
      }
    ]);
  });
});
