import "server-only";

import { randomUUID } from "node:crypto";
import type { ContactDetail, ContactSummary } from "@/lib/contact-types";
import { type ContactEventType } from "@/lib/contact-event-types";
import {
  diffContactTags,
  getAddedContactNotes,
  getChangedContactProfileFields,
  getContactMergeMetadata,
  normalizeExportFieldKeys
} from "@/lib/contact-event-utils";
import { insertContactEvent } from "@/lib/repositories/contact-events-repository";
import { findSiteOwnerRow } from "@/lib/repositories/visitor-presence-repository";

type ContactSnapshot = ContactSummary | ContactDetail;

async function resolveOwnerUserId(input: {
  ownerUserId?: string | null;
  siteId?: string | null;
}) {
  if (input.ownerUserId) {
    return input.ownerUserId;
  }

  if (!input.siteId) {
    return null;
  }

  return (await findSiteOwnerRow(input.siteId))?.user_id ?? null;
}

async function recordContactEvent(input: {
  type: ContactEventType;
  siteId?: string | null;
  contactEmail?: string | null;
  ownerUserId?: string | null;
  actorUserId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const ownerUserId = await resolveOwnerUserId(input);
  if (!ownerUserId) {
    return;
  }

  await insertContactEvent({
    id: randomUUID(),
    ownerUserId,
    siteId: input.siteId ?? null,
    contactEmail: input.contactEmail ?? null,
    eventType: input.type,
    actorUserId: input.actorUserId ?? null,
    metadataJson: input.metadata ?? {}
  });
}

export async function recordContactCreatedEvent(input: {
  contact: ContactSnapshot;
  source: string;
  actorUserId?: string | null;
}) {
  await recordContactEvent({
    type: "contact.created",
    siteId: input.contact.siteId,
    contactEmail: input.contact.email,
    actorUserId: input.actorUserId ?? null,
    metadata: {
      source: input.source,
      contactId: input.contact.id,
      status: input.contact.status,
      tags: input.contact.tags
    }
  });
}

export async function recordContactMergedEvent(input: {
  before: ContactSnapshot;
  after: ContactSnapshot;
  source: string;
}) {
  const metadata = getContactMergeMetadata(input.before, input.after);
  if (!metadata) {
    return;
  }

  await recordContactEvent({
    type: "contact.merged",
    siteId: input.after.siteId,
    contactEmail: input.after.email,
    metadata: {
      source: input.source,
      contactId: input.after.id,
      ...metadata
    }
  });
}

export async function recordContactDiffEvents(input: {
  before: ContactSnapshot;
  after: ContactSnapshot;
  source: string;
  actorUserId?: string | null;
  includeNoteEvents?: boolean;
}) {
  const changedFields = getChangedContactProfileFields(input.before, input.after);
  if (changedFields.length) {
    await recordContactEvent({
      type: "contact.updated",
      siteId: input.after.siteId,
      contactEmail: input.after.email,
      actorUserId: input.actorUserId ?? null,
      metadata: {
        source: input.source,
        contactId: input.after.id,
        changedFields
      }
    });
  }

  if (input.before.status !== input.after.status) {
    await recordContactEvent({
      type: "contact.status_changed",
      siteId: input.after.siteId,
      contactEmail: input.after.email,
      actorUserId: input.actorUserId ?? null,
      metadata: {
        source: input.source,
        contactId: input.after.id,
        previousStatus: input.before.status,
        status: input.after.status
      }
    });
  }

  const tagDiff = diffContactTags(input.before.tags, input.after.tags);
  for (const tag of tagDiff.added) {
    await recordContactEvent({
      type: "contact.tag_added",
      siteId: input.after.siteId,
      contactEmail: input.after.email,
      actorUserId: input.actorUserId ?? null,
      metadata: {
        source: input.source,
        contactId: input.after.id,
        tag
      }
    });
  }

  for (const tag of tagDiff.removed) {
    await recordContactEvent({
      type: "contact.tag_removed",
      siteId: input.after.siteId,
      contactEmail: input.after.email,
      actorUserId: input.actorUserId ?? null,
      metadata: {
        source: input.source,
        contactId: input.after.id,
        tag
      }
    });
  }

  if (!input.includeNoteEvents) {
    return;
  }

  const addedNotes = getAddedContactNotes(input.before.notes, input.after.notes);
  for (const note of addedNotes) {
    await recordContactEvent({
      type: "contact.note_added",
      siteId: input.after.siteId,
      contactEmail: input.after.email,
      actorUserId: input.actorUserId ?? null,
      metadata: {
        source: input.source,
        contactId: input.after.id,
        noteId: note.id,
        noteAuthorUserId: note.authorUserId
      }
    });
  }
}

export async function recordContactExportEvent(input: {
  ownerUserId: string;
  actorUserId: string;
  contactIds: string[];
  fieldKeys: string[];
  siteIds: string[];
}) {
  await recordContactEvent({
    type: "contact.exported",
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId,
    metadata: {
      source: "dashboard",
      contactCount: input.contactIds.length,
      contactIds: input.contactIds,
      fieldKeys: normalizeExportFieldKeys(input.fieldKeys),
      siteIds: Array.from(new Set(input.siteIds)).sort()
    }
  });
}

export async function recordContactDeletedEvent(input: {
  contact: ContactSnapshot;
  actorUserId?: string | null;
}) {
  await recordContactEvent({
    type: "contact.deleted",
    siteId: input.contact.siteId,
    contactEmail: input.contact.email,
    actorUserId: input.actorUserId ?? null,
    metadata: {
      source: "dashboard",
      contactId: input.contact.id,
      status: input.contact.status
    }
  });
}
