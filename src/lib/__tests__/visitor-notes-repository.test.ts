const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  deleteVisitorNoteRow,
  findSiteRowForOwner,
  findVisitorNoteRow,
  upsertVisitorNoteRow
} from "@/lib/repositories/visitor-notes-repository";

describe("visitor notes repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds owned sites and visitor notes with null fallbacks", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "site_1" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            site_id: "site_1",
            identity_type: "email",
            identity_value: "alex@example.com",
            note: "Pricing follow-up",
            updated_at: "2026-03-29T10:00:00.000Z"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(findSiteRowForOwner("site_1", "owner_1")).resolves.toEqual({ id: "site_1" });
    await expect(findSiteRowForOwner("site_2", "owner_1")).resolves.toBeNull();
    await expect(findVisitorNoteRow("site_1", "email", "alex@example.com")).resolves.toMatchObject({
      note: "Pricing follow-up"
    });
    await expect(findVisitorNoteRow("site_1", "email", "nobody@example.com")).resolves.toBeNull();

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM sites");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("FROM visitor_notes");
  });

  it("upserts and deletes visitor notes", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [
        {
          site_id: "site_1",
          identity_type: "session",
          identity_value: "session_1",
          note: "Asked about integrations",
          updated_at: "2026-03-29T10:05:00.000Z"
        }
      ]
    });

    await expect(
      upsertVisitorNoteRow({
        siteId: "site_1",
        identityType: "session",
        identityValue: "session_1",
        note: "Asked about integrations",
        updatedByUserId: "user_1"
      })
    ).resolves.toMatchObject({ identity_type: "session" });
    await deleteVisitorNoteRow("site_1", "session", "session_1");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("ON CONFLICT (site_id, identity_type, identity_value)");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual([
      "site_1",
      "session",
      "session_1",
      "Asked about integrations",
      "user_1"
    ]);
    expect(mocks.query.mock.calls[1]?.[0]).toContain("DELETE FROM visitor_notes");
  });
});
