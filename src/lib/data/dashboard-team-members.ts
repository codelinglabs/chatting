import type { DashboardTeamMember } from "@/lib/data/settings-types";
import { findDashboardSettingsRow } from "@/lib/repositories/settings-repository";
import { listActiveTeamMemberRows } from "@/lib/repositories/workspace-repository";
import { displayNameFromEmail, firstNameFromDisplayName, initialsFromLabel } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

function splitName(email: string, firstName: string | null, lastName: string | null) {
  const displayName = displayNameFromEmail(email);
  const fallbackFirstName = firstNameFromDisplayName(displayName);
  const fallbackLastName = displayName.replace(fallbackFirstName, "").trim();

  return {
    firstName: optionalText(firstName) || fallbackFirstName,
    lastName: optionalText(lastName) || fallbackLastName
  };
}

function formatLastActiveLabel(lastSeenAt: string | null) {
  if (!lastSeenAt) {
    return "Never";
  }

  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const minutes = Math.max(0, Math.round(diffMs / (60 * 1000)));

  if (minutes <= 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric" }).format(new Date(lastSeenAt));
}

function isOnline(lastSeenAt: string | null) {
  if (!lastSeenAt) {
    return false;
  }

  return Date.now() - new Date(lastSeenAt).getTime() <= 5 * 60 * 1000;
}

export async function listDashboardTeamMembers(userId: string): Promise<DashboardTeamMember[]> {
  const workspace = await getWorkspaceAccess(userId);
  const [ownerRow, activeTeamRows] = await Promise.all([
    findDashboardSettingsRow(workspace.ownerUserId),
    listActiveTeamMemberRows(workspace.ownerUserId)
  ]);

  if (!ownerRow) {
    throw new Error("Workspace owner not found.");
  }

  const ownerNameParts = splitName(ownerRow.email, ownerRow.first_name, ownerRow.last_name);
  const ownerName =
    [ownerNameParts.firstName, ownerNameParts.lastName].filter(Boolean).join(" ").trim() ||
    displayNameFromEmail(ownerRow.email);

  return [
    {
      id: ownerRow.user_id,
      name: ownerName,
      email: ownerRow.email,
      initials: initialsFromLabel(ownerName),
      role: "owner",
      status: isOnline(ownerRow.last_seen_at) ? "online" : "offline",
      lastActiveLabel: formatLastActiveLabel(ownerRow.last_seen_at),
      isCurrentUser: ownerRow.user_id === userId,
      avatarDataUrl: optionalText(ownerRow.avatar_data_url)
    },
    ...activeTeamRows.map((member) => {
      const nameParts = splitName(member.email, member.first_name, member.last_name);
      const name =
        [nameParts.firstName, nameParts.lastName].filter(Boolean).join(" ").trim() ||
        displayNameFromEmail(member.email);

      return {
        id: member.user_id,
        name,
        email: member.email,
        initials: initialsFromLabel(name),
        role: member.role,
        status: isOnline(member.last_seen_at) ? "online" : "offline",
        lastActiveLabel: formatLastActiveLabel(member.last_seen_at),
        isCurrentUser: member.user_id === userId,
        avatarDataUrl: optionalText(member.avatar_data_url)
      } satisfies DashboardTeamMember;
    })
  ];
}
