import { requireUser } from "@/lib/auth";
import { getDashboardSettingsData } from "@/lib/data";
import { DashboardTeamPage } from "../dashboard-team-page";

export default async function TeamPage() {
  const user = await requireUser();
  const settings = await getDashboardSettingsData(user.id);

  return (
    <DashboardTeamPage
      canManageTeam={user.workspaceRole !== "member"}
      initialMembers={settings.teamMembers}
      initialInvites={settings.teamInvites}
    />
  );
}
