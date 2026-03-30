import type { VisitorNote, VisitorNoteIdentityType } from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { findConversationIdentityForActivity } from "@/lib/repositories/conversations-read-repository";
import {
  deleteVisitorNoteRow,
  findSiteRowForOwner,
  findVisitorNoteRow,
  upsertVisitorNoteRow
} from "@/lib/repositories/visitor-notes-repository";

type VisitorIdentity = {
  siteId: string;
  identityType: VisitorNoteIdentityType;
  identityValue: string;
};

function buildVisitorIdentity(input: {
  siteId: string;
  sessionId?: string | null;
  email?: string | null;
}): VisitorIdentity | null {
  const email = optionalText(input.email)?.toLowerCase();
  if (email) {
    return {
      siteId: input.siteId,
      identityType: "email",
      identityValue: email
    };
  }
  const sessionId = optionalText(input.sessionId);
  if (!sessionId) {
    return null;
  }
  return {
    siteId: input.siteId,
    identityType: "session",
    identityValue: sessionId
  };
}

function mapVisitorNote(row: Awaited<ReturnType<typeof findVisitorNoteRow>>) {
  if (!row) {
    return null;
  }
  return {
    siteId: row.site_id,
    identityType: row.identity_type,
    identityValue: row.identity_value,
    note: row.note,
    updatedAt: row.updated_at
  } satisfies VisitorNote;
}

async function resolveConversationIdentity(conversationId: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const identity = await findConversationIdentityForActivity(conversationId, workspace.ownerUserId);
  if (!identity) {
    return null;
  }
  return buildVisitorIdentity({
    siteId: identity.site_id,
    sessionId: identity.session_id,
    email: identity.email
  });
}

async function ensureSiteAccess(siteId: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return findSiteRowForOwner(siteId, workspace.ownerUserId);
}

async function saveVisitorNote(identity: VisitorIdentity, note: string, updatedByUserId: string) {
  const normalizedNote = note.trim();
  if (!normalizedNote) {
    await deleteVisitorNoteRow(identity.siteId, identity.identityType, identity.identityValue);
    return { note: null, updatedAt: null };
  }

  const saved = mapVisitorNote(
    await upsertVisitorNoteRow({
      siteId: identity.siteId,
      identityType: identity.identityType,
      identityValue: identity.identityValue,
      note: normalizedNote,
      updatedByUserId
    })
  );

  return {
    note: saved?.note ?? null,
    updatedAt: saved?.updatedAt ?? null
  };
}

export async function getConversationVisitorNote(conversationId: string, userId: string) {
  const identity = await resolveConversationIdentity(conversationId, userId);
  if (!identity) {
    return null;
  }
  const note = mapVisitorNote(
    await findVisitorNoteRow(identity.siteId, identity.identityType, identity.identityValue)
  );

  return { note: note?.note ?? null, updatedAt: note?.updatedAt ?? null };
}

export async function getSiteVisitorNote(input: {
  siteId: string;
  sessionId?: string | null;
  email?: string | null;
  userId: string;
}) {
  if (!(await ensureSiteAccess(input.siteId, input.userId))) {
    return null;
  }

  const identity = buildVisitorIdentity(input);
  if (!identity) {
    return { note: null, updatedAt: null };
  }
  const note = mapVisitorNote(
    await findVisitorNoteRow(identity.siteId, identity.identityType, identity.identityValue)
  );

  return { note: note?.note ?? null, updatedAt: note?.updatedAt ?? null };
}

export async function updateConversationVisitorNote(conversationId: string, note: string, userId: string) {
  const identity = await resolveConversationIdentity(conversationId, userId);
  if (!identity) {
    return null;
  }

  return saveVisitorNote(identity, note, userId);
}

export async function updateSiteVisitorNote(input: {
  siteId: string;
  sessionId?: string | null;
  email?: string | null;
  note: string;
  userId: string;
}) {
  if (!(await ensureSiteAccess(input.siteId, input.userId))) {
    return null;
  }

  const identity = buildVisitorIdentity(input);
  if (!identity) {
    return { note: null, updatedAt: null };
  }

  return saveVisitorNote(identity, input.note, input.userId);
}

export async function migrateVisitorNoteIdentity(input: {
  siteId: string;
  sessionId: string;
  previousEmail?: string | null;
  nextEmail?: string | null;
  updatedByUserId?: string | null;
}) {
  const from = buildVisitorIdentity({
    siteId: input.siteId,
    sessionId: input.sessionId,
    email: input.previousEmail
  });
  const to = buildVisitorIdentity({
    siteId: input.siteId,
    sessionId: input.sessionId,
    email: input.nextEmail
  });

  if (!from || !to || (from.identityType === to.identityType && from.identityValue === to.identityValue)) {
    return;
  }

  const [fromNote, toNote] = await Promise.all([
    findVisitorNoteRow(from.siteId, from.identityType, from.identityValue),
    findVisitorNoteRow(to.siteId, to.identityType, to.identityValue)
  ]);

  if (!fromNote) {
    return;
  }

  if (!toNote) {
    await upsertVisitorNoteRow({
      siteId: to.siteId,
      identityType: to.identityType,
      identityValue: to.identityValue,
      note: fromNote.note,
      updatedByUserId: input.updatedByUserId ?? null
    });
  }

  await deleteVisitorNoteRow(from.siteId, from.identityType, from.identityValue);
}
