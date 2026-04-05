const mocks = vi.hoisted(() => ({
  randomUUID: vi.fn(),
  getSiteByPublicId: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  deleteHelpCenterArticleRow: vi.fn(),
  findHelpCenterArticleRowBySlug: vi.fn(),
  insertHelpCenterArticleRow: vi.fn(),
  listHelpCenterArticleRows: vi.fn(),
  updateHelpCenterArticleRow: vi.fn()
}));

vi.mock("node:crypto", () => ({
  randomUUID: mocks.randomUUID
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

vi.mock("@/lib/repositories/help-center-repository", () => ({
  deleteHelpCenterArticleRow: mocks.deleteHelpCenterArticleRow,
  findHelpCenterArticleRowBySlug: mocks.findHelpCenterArticleRowBySlug,
  insertHelpCenterArticleRow: mocks.insertHelpCenterArticleRow,
  listHelpCenterArticleRows: mocks.listHelpCenterArticleRows,
  updateHelpCenterArticleRow: mocks.updateHelpCenterArticleRow
}));

vi.mock("@/lib/data/sites", () => ({
  getSiteByPublicId: mocks.getSiteByPublicId
}));

import {
  createHelpCenterArticle,
  deleteHelpCenterArticle,
  getHelpCenterArticleForSite,
  listHelpCenterArticles,
  listHelpCenterArticlesForSite,
  updateHelpCenterArticle
} from "@/lib/data/help-center";

describe("help center data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.randomUUID.mockReturnValue("uuid_1");
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
  });

  it("lists, creates, updates, and deletes workspace articles", async () => {
    mocks.listHelpCenterArticleRows.mockResolvedValueOnce([
      { id: "article_1", title: "Billing", slug: "billing", body: "Answer", created_at: "", updated_at: "2026-04-02T12:00:00.000Z" }
    ]);
    mocks.insertHelpCenterArticleRow.mockResolvedValueOnce({
      id: "article_uuid_1",
      title: "Billing",
      slug: "billing",
      body: "Answer",
      created_at: "",
      updated_at: "2026-04-02T12:00:00.000Z"
    });
    mocks.updateHelpCenterArticleRow.mockResolvedValueOnce({
      id: "article_1",
      title: "Billing updated",
      slug: "billing",
      body: "Updated answer",
      created_at: "",
      updated_at: "2026-04-02T12:05:00.000Z"
    });
    mocks.deleteHelpCenterArticleRow.mockResolvedValueOnce(true);

    await expect(listHelpCenterArticles("user_1")).resolves.toEqual([
      { id: "article_1", title: "Billing", slug: "billing", body: "Answer", updatedAt: "2026-04-02T12:00:00.000Z" }
    ]);
    await expect(createHelpCenterArticle("user_1", { title: " Billing ", slug: " billing ", body: " Answer " })).resolves.toEqual({
      id: "article_uuid_1",
      title: "Billing",
      slug: "billing",
      body: "Answer",
      updatedAt: "2026-04-02T12:00:00.000Z"
    });
    await expect(updateHelpCenterArticle("user_1", { id: "article_1", title: " Billing updated ", slug: "billing", body: " Updated answer " })).resolves.toEqual({
      id: "article_1",
      title: "Billing updated",
      slug: "billing",
      body: "Updated answer",
      updatedAt: "2026-04-02T12:05:00.000Z"
    });
    await expect(deleteHelpCenterArticle("user_1", "article_1")).resolves.toBeUndefined();
  });

  it("maps public site lookups and slug conflicts", async () => {
    mocks.getSiteByPublicId.mockResolvedValue({ id: "site_1", userId: "owner_1", name: "Docs" });
    mocks.listHelpCenterArticleRows.mockResolvedValueOnce([
      { id: "article_1", title: "Billing", slug: "billing", body: "Answer", created_at: "", updated_at: "2026-04-02T12:00:00.000Z" }
    ]);
    mocks.findHelpCenterArticleRowBySlug.mockResolvedValueOnce({
      id: "article_1",
      title: "Billing",
      slug: "billing",
      body: "Answer",
      created_at: "",
      updated_at: "2026-04-02T12:00:00.000Z"
    });

    await expect(listHelpCenterArticlesForSite("site_1")).resolves.toEqual({
      site: { id: "site_1", userId: "owner_1", name: "Docs" },
      articles: [{ id: "article_1", title: "Billing", slug: "billing", body: "Answer", updatedAt: "2026-04-02T12:00:00.000Z" }]
    });
    await expect(getHelpCenterArticleForSite("site_1", "Billing")).resolves.toEqual({
      site: { id: "site_1", userId: "owner_1", name: "Docs" },
      article: { id: "article_1", title: "Billing", slug: "billing", body: "Answer", updatedAt: "2026-04-02T12:00:00.000Z" }
    });

    mocks.insertHelpCenterArticleRow.mockRejectedValueOnce({ code: "23505" });
    await expect(
      createHelpCenterArticle("user_1", { title: "Billing", slug: "billing", body: "Answer" })
    ).rejects.toThrow("SLUG_TAKEN");
  });
});
