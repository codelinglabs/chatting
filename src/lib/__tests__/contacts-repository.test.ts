const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import { listDashboardContactRows } from "@/lib/repositories/contacts-repository";

describe("contacts repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists dashboard contacts with shared aggregate queries instead of per-row subqueries", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            site_id: "site_1",
            site_name: "Chatting",
            email: "tina@acme.com",
            latest_conversation_id: "conv_1",
            latest_session_id: "session_1",
            tags_json: ["enterprise"],
            custom_fields_json: { plan: "Pro" },
            first_seen_at: "2026-04-01T10:00:00.000Z",
            last_seen_at: "2026-04-05T10:00:00.000Z",
            created_at: "2026-04-01T10:00:00.000Z",
            updated_at: "2026-04-05T10:00:00.000Z",
            name: "Tina Martinez",
            phone: null,
            company: "Acme Corp",
            role: null,
            avatar_url: null,
            status_key: "customer",
            location_json: { city: "San Francisco", region: "California", country: "US" },
            source_json: { referrer: "google.com", utmMedium: "organic" },
            notes_json: null,
            page_history_json: null,
            total_page_views: 4,
            conversation_count: 3,
            total_visits: 2,
            avg_session_seconds: 120
          }
        ]
      });

    await expect(listDashboardContactRows("owner_1", "user_1")).resolves.toHaveLength(1);

    const sql = String(mocks.query.mock.calls[2]?.[0] ?? "");
    expect(sql).toContain("WITH accessible_contacts AS");
    expect(sql).toContain("contact_keys AS");
    expect(sql).toContain("LEFT JOIN conversation_stats");
    expect(sql).toContain("LEFT JOIN session_stats");
    expect(sql).toContain("NULL::jsonb AS notes_json");
    expect(sql).toContain("NULL::jsonb AS page_history_json");
    expect(sql).toContain("ORDER BY ac.last_seen_at DESC, ac.email ASC");
    expect(mocks.query.mock.calls[2]?.[1]).toEqual(["owner_1", "user_1"]);
  });
});
