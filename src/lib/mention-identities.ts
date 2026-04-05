import type { WorkspaceMentionNotificationRow } from "@/lib/repositories/mention-notification-repository";
import { displayNameFromEmail, firstNameFromDisplayName } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";

export type MentionableTeammate = {
  userId: string;
  displayName: string;
  handle: string;
};

export type MentionNotificationRecipient = WorkspaceMentionNotificationRow & {
  displayName: string;
  handle: string;
  notificationAddress: string;
  canReceiveMentions: boolean;
  legacyAliases: Set<string>;
};

export type MentionResolution = {
  recipients: MentionNotificationRecipient[];
  sent: string[];
  ambiguous: string[];
  unresolved: string[];
  disabled: string[];
};
function collapseMentionValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
function buildMentionVariants(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  const collapsed = collapseMentionValue(value ?? "");
  return new Set([trimmed, collapsed].filter(Boolean) as string[]);
}
function slugMentionValue(value: string | null | undefined) {
  const normalized = (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
export function buildMentionDisplayName(
  row: Pick<WorkspaceMentionNotificationRow, "email" | "first_name" | "last_name">
) {
  const explicit = [optionalText(row.first_name), optionalText(row.last_name)]
    .filter(Boolean)
    .join(" ")
    .trim();
  return explicit || displayNameFromEmail(row.email);
}
function buildCanonicalHandleBase(
  row: Pick<WorkspaceMentionNotificationRow, "email" | "first_name" | "last_name">,
  displayName: string
) {
  const firstName = optionalText(row.first_name) || firstNameFromDisplayName(displayName);
  const lastName = optionalText(row.last_name);
  const emailLocalPart = row.email.split("@")[0] || "";

  return (
    slugMentionValue([firstName, lastName].filter(Boolean).join(" ")) ||
    slugMentionValue(displayName) ||
    slugMentionValue(emailLocalPart)
  );
}
function buildLegacyAliases(
  row: Pick<WorkspaceMentionNotificationRow, "email" | "first_name" | "last_name">,
  displayName: string
) {
  const firstName = optionalText(row.first_name) || firstNameFromDisplayName(displayName);
  const lastName = optionalText(row.last_name);
  const emailLocalPart = row.email.split("@")[0] || "";
  const aliases = new Set<string>();
  for (const value of [firstName, lastName, displayName, emailLocalPart]) {
    for (const alias of buildMentionVariants(value)) {
      aliases.add(alias);
    }
  }
  return aliases;
}
export function extractMentionHandles(value: string) {
  const handles = new Set<string>();
  const pattern = /(^|[^a-z0-9._-])@([a-z0-9][a-z0-9._-]{0,63})/gi;
  for (const match of value.matchAll(pattern)) {
    const handle = match[2]?.trim().toLowerCase();
    if (handle) {
      handles.add(handle);
    }
  }
  return Array.from(handles);
}
function buildMentionRecipients(
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  const handleCounts = new Map<string, number>();
  return rows
    .filter((row) => row.user_id !== mentionerUserId)
    .map((row) => {
      const displayName = buildMentionDisplayName(row);
      const baseHandle =
        buildCanonicalHandleBase(row, displayName) ||
        `teammate-${slugMentionValue(row.user_id).slice(0, 6) || "1"}`;
      const nextCount = (handleCounts.get(baseHandle) ?? 0) + 1;
      handleCounts.set(baseHandle, nextCount);
      return {
        ...row,
        displayName,
        handle: nextCount === 1 ? baseHandle : `${baseHandle}-${nextCount}`,
        notificationAddress: optionalText(row.notification_email) || row.email,
        canReceiveMentions: (row.email_notifications ?? true) && (row.mention_notifications ?? true),
        legacyAliases: buildLegacyAliases(row, displayName)
      } satisfies MentionNotificationRecipient;
    });
}
export function buildMentionableTeammates(
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  return buildMentionRecipients(rows, mentionerUserId)
    .filter((recipient) => recipient.canReceiveMentions)
    .map(
      (recipient) =>
        ({
          userId: recipient.user_id,
          displayName: recipient.displayName,
          handle: recipient.handle
        }) satisfies MentionableTeammate
    );
}
export function resolveMentionResolution(
  value: string,
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  const recipients = buildMentionRecipients(rows, mentionerUserId);
  const matched = new Map<string, MentionNotificationRecipient>();
  const sent: string[] = [];
  const ambiguous: string[] = [];
  const unresolved: string[] = [];
  const disabled: string[] = [];
  for (const handle of extractMentionHandles(value)) {
    const exactMatch = recipients.find((recipient) => recipient.handle === handle);
    if (exactMatch) {
      if (exactMatch.canReceiveMentions) {
        matched.set(exactMatch.user_id, exactMatch);
        sent.push(handle);
      } else {
        disabled.push(handle);
      }
      continue;
    }
    const handleVariants = buildMentionVariants(handle);
    const legacyMatches = recipients.filter((recipient) =>
      Array.from(handleVariants).some((variant) => recipient.legacyAliases.has(variant))
    );
    if (legacyMatches.length === 1) {
      if (legacyMatches[0].canReceiveMentions) {
        matched.set(legacyMatches[0].user_id, legacyMatches[0]);
        sent.push(handle);
      } else {
        disabled.push(handle);
      }
      continue;
    }

    if (legacyMatches.length > 1) {
      ambiguous.push(handle);
      continue;
    }

    unresolved.push(handle);
  }
  return {
    recipients: Array.from(matched.values()),
    sent,
    ambiguous,
    unresolved,
    disabled
  } satisfies MentionResolution;
}
export function resolveMentionRecipients(
  value: string,
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  return resolveMentionResolution(value, rows, mentionerUserId).recipients;
}
