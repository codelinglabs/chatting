import { requireUser } from "@/lib/auth";
import {
  listInboxConversationSummaries,
  listDashboardTeamMembers,
  listSitesForUser
} from "@/lib/data";
import { getDashboardConversationThreadById } from "@/lib/data/dashboard-conversation-thread";
import { getDashboardAiAssistAccess } from "@/lib/data/settings-ai-assist-access";
import type { DashboardStats } from "@/lib/types";
import { DashboardClient } from "../dashboard-client";

const EMPTY_INBOX_STATS: DashboardStats = {
  totalConversations: 0,
  answeredConversations: 0,
  ratedConversations: 0,
  topTags: []
};

type DashboardInboxPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function DashboardInboxPage({ searchParams }: DashboardInboxPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const activeId = params.id || null;
  const [conversations, sites, teamMembers, aiAssist, activeConversation] = await Promise.all([
    listInboxConversationSummaries(user.id),
    listSitesForUser(user.id),
    listDashboardTeamMembers(user.id),
    getDashboardAiAssistAccess(user.id),
    activeId
      ? getDashboardConversationThreadById(activeId, user.id)
      : Promise.resolve(null)
  ]);

  return (
    <DashboardClient
      userEmail={user.email}
      initialStats={EMPTY_INBOX_STATS}
      initialSites={sites}
      initialConversations={conversations}
      initialActiveConversation={activeConversation}
      initialTeamMembers={teamMembers}
      initialAiAssistSettings={aiAssist.settings}
      initialBillingPlanKey={aiAssist.planKey}
    />
  );
}
