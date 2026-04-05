import type { VisitorNoteIdentityType } from "@/lib/types";
import type { VisitorNoteRow } from "@/lib/repositories/visitor-notes-repository";
import { parseStoredVisitorNoteMentionTokens } from "@/lib/visitor-note-mention-structure";
import { optionalText } from "@/lib/utils";

export type VisitorIdentity = {
  siteId: string;
  identityType: VisitorNoteIdentityType;
  identityValue: string;
};

export function buildVisitorIdentity(input: {
  siteId: string;
  sessionId?: string | null;
  email?: string | null;
}): VisitorIdentity | null {
  const email = optionalText(input.email)?.toLowerCase();
  if (email) {
    return { siteId: input.siteId, identityType: "email", identityValue: email };
  }

  const sessionId = optionalText(input.sessionId);
  return sessionId
    ? { siteId: input.siteId, identityType: "session", identityValue: sessionId }
    : null;
}

export function mapVisitorNote(row: VisitorNoteRow | null) {
  if (!row) {
    return null;
  }

  return {
    siteId: row.site_id,
    identityType: row.identity_type,
    identityValue: row.identity_value,
    note: row.note,
    updatedAt: row.updated_at,
    mentions: parseStoredVisitorNoteMentionTokens(row.mentions_json)
  };
}
