import {
  extractMentionHandles,
  resolveMentionResolution,
  type MentionNotificationRecipient
} from "@/lib/mention-identities";
import type { WorkspaceMentionNotificationRow } from "@/lib/repositories/mention-notification-repository";

export type VisitorNoteMentionStatus =
  | "resolved"
  | "ambiguous"
  | "unresolved"
  | "disabled";

export type VisitorNoteMentionToken = {
  rawHandle: string;
  status: VisitorNoteMentionStatus;
  userId: string | null;
  canonicalHandle: string | null;
  displayName: string | null;
};

export type VisitorNoteMentionResolution = {
  mentions: VisitorNoteMentionToken[];
  recipients: MentionNotificationRecipient[];
  sent: string[];
  ambiguous: string[];
  unresolved: string[];
  disabled: string[];
};

export function emptyVisitorNoteMentionResolution(): VisitorNoteMentionResolution {
  return { mentions: [], recipients: [], sent: [], ambiguous: [], unresolved: [], disabled: [] };
}

function buildMentionToken(
  handle: string,
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  const singleMention = resolveMentionResolution(`@${handle}`, rows, mentionerUserId);
  const recipient = singleMention.recipients[0] ?? null;

  return {
    mention: {
      rawHandle: handle,
      status: singleMention.sent.length
        ? "resolved"
        : singleMention.disabled.length
          ? "disabled"
          : singleMention.ambiguous.length
            ? "ambiguous"
            : "unresolved",
      userId: recipient?.user_id ?? null,
      canonicalHandle: recipient?.handle ?? null,
      displayName: recipient?.displayName ?? null
    } satisfies VisitorNoteMentionToken,
    recipients: recipient ? [recipient] : [],
    sent: singleMention.sent,
    ambiguous: singleMention.ambiguous,
    unresolved: singleMention.unresolved,
    disabled: singleMention.disabled
  };
}

export function buildVisitorNoteMentionResolution(
  note: string,
  rows: WorkspaceMentionNotificationRow[],
  mentionerUserId: string
) {
  const recipients = new Map<string, MentionNotificationRecipient>();
  const resolution = emptyVisitorNoteMentionResolution();

  for (const handle of extractMentionHandles(note)) {
    const token = buildMentionToken(handle, rows, mentionerUserId);
    resolution.mentions.push(token.mention);
    resolution.sent.push(...token.sent);
    resolution.ambiguous.push(...token.ambiguous);
    resolution.unresolved.push(...token.unresolved);
    resolution.disabled.push(...token.disabled);

    for (const recipient of token.recipients) {
      recipients.set(recipient.user_id, recipient);
    }
  }

  return {
    ...resolution,
    recipients: Array.from(recipients.values())
  } satisfies VisitorNoteMentionResolution;
}

export function parseStoredVisitorNoteMentionTokens(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as VisitorNoteMentionToken[];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const mention = entry as Partial<VisitorNoteMentionToken>;
    const rawHandle = mention.rawHandle?.trim().toLowerCase();
    if (!rawHandle) {
      return [];
    }

    const status = mention.status;
    return [
      {
        rawHandle,
        status:
          status === "resolved" ||
          status === "ambiguous" ||
          status === "unresolved" ||
          status === "disabled"
            ? status
            : "unresolved",
        userId: mention.userId?.trim() || null,
        canonicalHandle: mention.canonicalHandle?.trim().toLowerCase() || null,
        displayName: mention.displayName?.trim() || null
      } satisfies VisitorNoteMentionToken
    ];
  });
}
