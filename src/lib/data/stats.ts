import {
  getConversationTotalsForUser,
  getRatedConversationCountForUser,
  listTopTagsForUser
} from "@/lib/repositories/stats-repository";
import type { DashboardStats } from "@/lib/types";

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totals, rated, tags] = await Promise.all([
    getConversationTotalsForUser(userId),
    getRatedConversationCountForUser(userId),
    listTopTagsForUser(userId)
  ]);

  return {
    totalConversations: Number(totals.total ?? 0),
    answeredConversations: Number(totals.answered ?? 0),
    ratedConversations: Number(rated ?? 0),
    topTags: tags.map((row) => ({ tag: row.tag, count: Number(row.count) }))
  };
}
