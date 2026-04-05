import { randomUUID } from "node:crypto";
import { normalizeBillingPlanKey } from "@/lib/billing-plans";
import {
  recordContactCreatedEvent,
  recordContactDeletedEvent,
  recordContactDiffEvents,
  recordContactExportEvent,
  recordContactMergedEvent
} from "@/lib/contact-events";
import { getContactMergeMetadata } from "@/lib/contact-event-utils";
import type { ContactConversationHistoryEntry, ContactDetail, ContactNote, ContactPageHistoryEntry } from "@/lib/contact-types";
import { type ContactListPayload, type ContactWorkspaceSettings } from "@/lib/contact-types";
import {
  contactDisplayName,
  decodeContactId,
  encodeContactId,
  parseContactSettingsJson
} from "@/lib/contact-utils";
import { getContactPlanLimits } from "@/lib/plan-limits";
import { query } from "@/lib/db";
import { DEFAULT_TAGS } from "@/lib/data/constants";
import { gravatarUrlForEmail } from "@/lib/contact-avatar";
import { findBillingAccountRow } from "@/lib/repositories/billing-repository";
import { findWorkspaceContactSettingsValue, upsertWorkspaceContactSettings } from "@/lib/repositories/contact-settings-repository";
import {
  deleteDashboardContactRow,
  findAccessibleDashboardContactRow,
  findDashboardContactRow,
  listDashboardContactTagOptions as listDashboardContactTagOptionsRows,
  listDashboardContactRows,
  saveDashboardContactRow,
  type DashboardContactRow
} from "@/lib/repositories/contacts-repository";
import { workspaceAccessClause } from "@/lib/repositories/workspace-repository";
import { displayNameFromEmail } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

function pagePathFromUrl(value: string | null | undefined) {
  const candidate = optionalText(value);
  if (!candidate) {
    return "/";
  }

  try {
    return new URL(candidate).pathname || "/";
  } catch {
    return candidate;
  }
}

function parseContactNotes(value: unknown): ContactNote[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const note = entry as Partial<ContactNote>;
      if (!note.id || !note.body || !note.authorUserId || !note.authorName || !note.createdAt || !note.updatedAt) {
        return null;
      }

      return {
        id: note.id,
        body: note.body,
        authorUserId: note.authorUserId,
        authorName: note.authorName,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      } satisfies ContactNote;
    })
    .filter((note): note is ContactNote => Boolean(note))
    .slice(0, 100);
}

function parsePageHistory(value: unknown): ContactPageHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const page = entry as Partial<ContactPageHistoryEntry>;
      if (!page.page || !page.seenAt) {
        return null;
      }

      return {
        page: page.page,
        seenAt: page.seenAt,
        durationSeconds: Number(page.durationSeconds ?? 0)
      } satisfies ContactPageHistoryEntry;
    })
    .filter((entry): entry is ContactPageHistoryEntry => Boolean(entry))
    .slice(0, 100);
}

function mapContactRow(row: DashboardContactRow) {
  return {
    id: encodeContactId(row.site_id, row.email),
    siteId: row.site_id,
    siteName: row.site_name,
    email: row.email,
    name: contactDisplayName(row.name, row.email),
    phone: optionalText(row.phone) ?? null,
    company: optionalText(row.company) ?? null,
    role: optionalText(row.role) ?? null,
    avatarUrl: optionalText(row.avatar_url) ?? gravatarUrlForEmail(row.email),
    status: optionalText(row.status_key) ?? "",
    tags: Array.isArray(row.tags_json) ? row.tags_json : [],
    customFields: row.custom_fields_json ?? {},
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    totalVisits: Number(row.total_visits ?? 0),
    totalPageViews: Number(row.total_page_views ?? 0),
    conversationCount: Number(row.conversation_count ?? 0),
    avgSessionSeconds: Number(row.avg_session_seconds ?? 0),
    location: {
      city: optionalText(row.location_json?.city) ?? null,
      region: optionalText(row.location_json?.region) ?? null,
      country: optionalText(row.location_json?.country) ?? null
    },
    source: {
      firstLandingPage: optionalText(row.source_json?.firstLandingPage) ?? null,
      referrer: optionalText(row.source_json?.referrer) ?? null,
      utmSource: optionalText(row.source_json?.utmSource) ?? null,
      utmMedium: optionalText(row.source_json?.utmMedium) ?? null,
      utmCampaign: optionalText(row.source_json?.utmCampaign) ?? null
    },
    latestConversationId: optionalText(row.latest_conversation_id) ?? null,
    latestSessionId: optionalText(row.latest_session_id) ?? null,
    notes: parseContactNotes(row.notes_json),
    pageHistory: parsePageHistory(row.page_history_json)
  };
}

function createEmptyContact(siteId: string, email: string, seenAt: string) {
  return {
    id: encodeContactId(siteId, email),
    siteId,
    siteName: "",
    email,
    name: contactDisplayName(null, email),
    phone: null,
    company: null,
    role: null,
    avatarUrl: gravatarUrlForEmail(email),
    status: "",
    tags: [],
    customFields: {},
    firstSeenAt: seenAt,
    lastSeenAt: seenAt,
    totalVisits: 0,
    totalPageViews: 0,
    conversationCount: 0,
    avgSessionSeconds: 0,
    location: { city: null, region: null, country: null },
    source: {
      firstLandingPage: null,
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null
    },
    latestConversationId: null,
    latestSessionId: null,
    notes: [],
    pageHistory: []
  };
}

function mergeDistinctValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildContactTagOptions(tags: string[]) {
  return mergeDistinctValues([...DEFAULT_TAGS, ...tags]);
}

function mergePageHistory(
  current: ContactPageHistoryEntry[],
  input: { pageUrl?: string | null; seenAt: string; durationSeconds?: number | null }
) {
  const page = pagePathFromUrl(input.pageUrl);
  if (!input.pageUrl) {
    return { pageHistory: current, incrementPageViews: false };
  }

  if (current[0]?.page === page) {
    return {
      pageHistory: [
        {
          ...current[0],
          seenAt: input.seenAt,
          durationSeconds: Math.max(current[0].durationSeconds, Number(input.durationSeconds ?? current[0].durationSeconds))
        },
        ...current.slice(1)
      ],
      incrementPageViews: false
    };
  }

  return {
    pageHistory: [
      { page, seenAt: input.seenAt, durationSeconds: Math.max(0, Number(input.durationSeconds ?? 0)) },
      ...current
    ].slice(0, 100),
    incrementPageViews: true
  };
}

function updateSource(current: Record<string, string | null>, pageUrl?: string | null, referrer?: string | null) {
  const resolvedPage = pagePathFromUrl(pageUrl);
  const url = optionalText(pageUrl);
  const searchParams = url ? new URL(url, "https://chatting.invalid").searchParams : null;

  return {
    firstLandingPage: current.firstLandingPage ?? (pageUrl ? resolvedPage : null),
    referrer: current.referrer ?? optionalText(referrer) ?? null,
    utmSource: current.utmSource ?? optionalText(searchParams?.get("utm_source")) ?? null,
    utmMedium: current.utmMedium ?? optionalText(searchParams?.get("utm_medium")) ?? null,
    utmCampaign: current.utmCampaign ?? optionalText(searchParams?.get("utm_campaign")) ?? null
  };
}

async function saveMappedContact(input: ReturnType<typeof mapContactRow>) {
  await saveDashboardContactRow({
    siteId: input.siteId,
    email: input.email,
    latestConversationId: input.latestConversationId,
    latestSessionId: input.latestSessionId,
    tagsJson: input.tags,
    customFieldsJson: input.customFields,
    firstSeenAt: input.firstSeenAt,
    lastSeenAt: input.lastSeenAt,
    name: input.name,
    phone: input.phone,
    company: input.company,
    role: input.role,
    avatarUrl: input.avatarUrl,
    statusKey: input.status,
    locationJson: input.location,
    sourceJson: input.source,
    notesJson: input.notes,
    pageHistoryJson: input.pageHistory,
    totalPageViews: input.totalPageViews
  });
}

async function resolveAccessibleContactContext(userId: string, contactId: string) {
  const decoded = decodeContactId(contactId);
  if (!decoded) {
    return null;
  }

  const workspace = await getWorkspaceAccess(userId);
  const row = await findAccessibleDashboardContactRow(
    workspace.ownerUserId,
    userId,
    decoded.siteId,
    decoded.email
  );
  if (!row) {
    return null;
  }

  return { decoded, workspace, row };
}

async function loadConversationHistory(ownerUserId: string, viewerUserId: string, siteId: string, email: string) {
  const result = await query<ContactConversationHistoryEntry>(
    `
      WITH matching_conversations AS (
        SELECT
          c.id,
          c.status,
          c.created_at,
          c.assigned_user_id
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE c.site_id = $1
          AND LOWER(COALESCE(c.email, '')) = LOWER($2)
          AND ${workspaceAccessClause("s.user_id", "$3", "$4")}
      ),
      message_counts AS (
        SELECT
          m.conversation_id,
          COUNT(*)::int AS message_count
        FROM messages m
        INNER JOIN matching_conversations mc
          ON mc.id = m.conversation_id
        GROUP BY m.conversation_id
      ),
      first_user_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          LEFT(NULLIF(TRIM(m.content), ''), 80) AS title
        FROM messages m
        INNER JOIN matching_conversations mc
          ON mc.id = m.conversation_id
        WHERE m.sender = 'user'
        ORDER BY m.conversation_id, m.created_at ASC
      )
      SELECT
        mc.id,
        COALESCE(fum.title, 'Conversation') AS title,
        mc.status,
        mc.created_at AS "createdAt",
        mc.assigned_user_id AS "assignedUserId",
        COALESCE(counts.message_count, 0) AS "messageCount"
      FROM matching_conversations mc
      LEFT JOIN first_user_messages fum
        ON fum.conversation_id = mc.id
      LEFT JOIN message_counts counts
        ON counts.conversation_id = mc.id
      ORDER BY mc.created_at DESC
    `,
    [siteId, email, ownerUserId, viewerUserId]
  );

  return result.rows;
}

async function resolveContactSettings(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const [account, settingsJson] = await Promise.all([
    findBillingAccountRow(workspace.ownerUserId),
    findWorkspaceContactSettingsValue(workspace.ownerUserId)
  ]);
  const planKey = normalizeBillingPlanKey(account?.plan_key);
  const settings = parseContactSettingsJson(settingsJson, planKey);

  return {
    workspace,
    planKey,
    settings,
    limits: getContactPlanLimits(planKey)
  };
}

async function hasAccessibleSite(userId: string, siteId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const result = await query<{ id: string }>(
    `
      SELECT s.id
      FROM sites s
      WHERE s.id = $1
        AND ${workspaceAccessClause("s.user_id", "$2", "$3")}
      LIMIT 1
    `,
    [siteId, workspace.ownerUserId, userId]
  );

  return Boolean(result.rows[0]?.id);
}

export async function getDashboardContactSettings(userId: string) {
  const { planKey, settings, limits } = await resolveContactSettings(userId);
  return { planKey, settings, limits };
}

export async function updateDashboardContactSettings(
  userId: string,
  input: ContactWorkspaceSettings
) {
  const { workspace, planKey } = await resolveContactSettings(userId);
  if (workspace.role === "member") {
    throw new Error("CONTACT_SETTINGS_FORBIDDEN");
  }

  const normalized = parseContactSettingsJson(JSON.stringify(input), planKey);
  await upsertWorkspaceContactSettings(workspace.ownerUserId, JSON.stringify(normalized));
  return normalized;
}

export async function listDashboardContacts(userId: string): Promise<ContactListPayload> {
  const workspace = await getWorkspaceAccess(userId);
  const [rows, account, settingsJson] = await Promise.all([
    listDashboardContactRows(workspace.ownerUserId, userId),
    findBillingAccountRow(workspace.ownerUserId),
    findWorkspaceContactSettingsValue(workspace.ownerUserId)
  ]);
  const planKey = normalizeBillingPlanKey(account?.plan_key);
  const settings = parseContactSettingsJson(settingsJson, planKey);
  const limits = getContactPlanLimits(planKey);
  const contacts = rows.map(mapContactRow);

  return {
    contacts,
    settings,
    planKey,
    limits,
    tagOptions: buildContactTagOptions(contacts.flatMap((contact) => contact.tags))
  };
}

export async function listDashboardContactTagOptions(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const tags = await listDashboardContactTagOptionsRows(workspace.ownerUserId, userId);
  return buildContactTagOptions(tags);
}

export async function getDashboardContact(userId: string, contactId: string): Promise<ContactDetail | null> {
  const resolved = await resolveAccessibleContactContext(userId, contactId);
  if (!resolved) {
    return null;
  }

  return {
    ...mapContactRow(resolved.row),
    conversations: []
  };
}

export async function getDashboardContactConversations(userId: string, contactId: string) {
  const resolved = await resolveAccessibleContactContext(userId, contactId);
  if (!resolved) {
    return null;
  }

  return loadConversationHistory(
    resolved.workspace.ownerUserId,
    userId,
    resolved.decoded.siteId,
    resolved.decoded.email
  );
}

export async function syncDashboardContactFromPresence(input: {
  siteId: string;
  email: string;
  conversationId?: string | null;
  sessionId?: string | null;
  seenAt: string;
  pageUrl?: string | null;
  referrer?: string | null;
  location?: { city?: string | null; region?: string | null; country?: string | null };
  visitorTags?: string[];
  customFields?: Record<string, string>;
  sessionDurationSeconds?: number | null;
  emitCreateEvent?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await findDashboardContactRow(input.siteId, email);
  const current = existing ? mapContactRow(existing) : createEmptyContact(input.siteId, email, input.seenAt);
  const history = mergePageHistory(current.pageHistory, {
    pageUrl: input.pageUrl,
    seenAt: input.seenAt,
    durationSeconds: input.sessionDurationSeconds
  });

  const nextContact = {
    ...current,
    tags: mergeDistinctValues([...(current.tags ?? []), ...(input.visitorTags ?? [])]),
    customFields: { ...current.customFields, ...(input.customFields ?? {}) },
    firstSeenAt:
      new Date(input.seenAt).getTime() < new Date(current.firstSeenAt).getTime()
        ? input.seenAt
        : current.firstSeenAt,
    lastSeenAt:
      new Date(input.seenAt).getTime() > new Date(current.lastSeenAt).getTime()
        ? input.seenAt
        : current.lastSeenAt,
    location: {
      city: optionalText(input.location?.city) ?? current.location.city,
      region: optionalText(input.location?.region) ?? current.location.region,
      country: optionalText(input.location?.country) ?? current.location.country
    },
    source: updateSource(current.source, input.pageUrl, input.referrer),
    latestConversationId: optionalText(input.conversationId) ?? current.latestConversationId,
    latestSessionId: optionalText(input.sessionId) ?? current.latestSessionId,
    pageHistory: history.pageHistory,
    totalPageViews: history.incrementPageViews ? current.totalPageViews + 1 : current.totalPageViews
  };

  await saveMappedContact(nextContact);

  if (!existing) {
    if (input.emitCreateEvent !== false) {
      await recordContactCreatedEvent({ contact: nextContact, source: "presence" });
    }
    return { contact: nextContact, created: true, merged: false };
  }

  await recordContactMergedEvent({
    before: current,
    after: nextContact,
    source: "presence"
  });
  await recordContactDiffEvents({
    before: current,
    after: nextContact,
    source: "presence"
  });

  return {
    contact: nextContact,
    created: false,
    merged: Boolean(getContactMergeMetadata(current, nextContact))
  };
}

export async function identifyDashboardContact(input: {
  siteId: string;
  email: string;
  sessionId?: string | null;
  conversationId?: string | null;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  visitorTags?: string[];
  customFields?: Record<string, string>;
  pageUrl?: string | null;
  referrer?: string | null;
  seenAt?: string | null;
}) {
  const seenAt = input.seenAt ?? new Date().toISOString();
  const existingBefore = await findDashboardContactRow(input.siteId, input.email.trim().toLowerCase());
  await syncDashboardContactFromPresence({
    siteId: input.siteId,
    email: input.email,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    seenAt,
    pageUrl: input.pageUrl,
    referrer: input.referrer,
    visitorTags: input.visitorTags,
    customFields: input.customFields,
    emitCreateEvent: false
  });

  const existing = await findDashboardContactRow(input.siteId, input.email.trim().toLowerCase());
  if (!existing) {
    return null;
  }

  const contact = mapContactRow(existing);
  const nextContact = {
    ...contact,
    name: optionalText(input.name) ?? contact.name,
    phone: optionalText(input.phone) ?? contact.phone,
    company: optionalText(input.company) ?? contact.company,
    role: optionalText(input.role) ?? contact.role,
    avatarUrl: optionalText(input.avatarUrl) ?? contact.avatarUrl,
    status: optionalText(input.status) ?? contact.status
  };

  await saveMappedContact(nextContact);

  if (!existingBefore) {
    await recordContactCreatedEvent({
      contact: nextContact,
      source: "identify"
    });
    return;
  }

  await recordContactDiffEvents({
    before: contact,
    after: nextContact,
    source: "identify"
  });
}

export async function updateDashboardContact(input: {
  userId: string;
  contactId: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  location?: { city?: string | null; region?: string | null; country?: string | null };
  tags?: string[];
  customFields?: Record<string, string>;
  note?: { id?: string | null; body: string } | null;
  deleteNoteId?: string | null;
}) {
  const workspace = await getWorkspaceAccess(input.userId);
  const detail = await getDashboardContact(input.userId, input.contactId);
  if (!detail) {
    return null;
  }

  let notes = [...detail.notes];
  if (input.note?.body?.trim()) {
    const existingNote = input.note.id ? notes.find((note) => note.id === input.note?.id) : null;
    const canEdit = !existingNote || workspace.role !== "member" || existingNote.authorUserId === input.userId;
    if (!canEdit) {
      throw new Error("CONTACT_NOTE_FORBIDDEN");
    }

    const now = new Date().toISOString();
    if (existingNote) {
      notes = notes.map((note) =>
        note.id === existingNote.id
          ? { ...note, body: input.note?.body.trim() || note.body, updatedAt: now }
          : note
      );
    } else {
      notes.unshift({
        id: randomUUID(),
        body: input.note.body.trim(),
        authorUserId: input.userId,
        authorName: displayNameFromEmail((await query<{ email: string }>("SELECT email FROM users WHERE id = $1 LIMIT 1", [input.userId])).rows[0]?.email ?? ""),
        createdAt: now,
        updatedAt: now
      });
    }
  }

  if (input.deleteNoteId) {
    const note = notes.find((entry) => entry.id === input.deleteNoteId);
    if (note && workspace.role === "member" && note.authorUserId !== input.userId) {
      throw new Error("CONTACT_NOTE_FORBIDDEN");
    }
    notes = notes.filter((note) => note.id !== input.deleteNoteId);
  }

  const nextDetail = {
    ...detail,
    name: optionalText(input.name) ?? detail.name,
    phone: input.phone === null ? null : optionalText(input.phone) ?? detail.phone,
    company: input.company === null ? null : optionalText(input.company) ?? detail.company,
    role: input.role === null ? null : optionalText(input.role) ?? detail.role,
    avatarUrl: input.avatarUrl === null ? null : optionalText(input.avatarUrl) ?? detail.avatarUrl,
    status: optionalText(input.status) ?? detail.status,
    location: {
      city: input.location?.city === null ? null : optionalText(input.location?.city) ?? detail.location.city,
      region: input.location?.region === null ? null : optionalText(input.location?.region) ?? detail.location.region,
      country: input.location?.country === null ? null : optionalText(input.location?.country) ?? detail.location.country
    },
    tags: Array.isArray(input.tags) ? mergeDistinctValues(input.tags) : detail.tags,
    customFields: input.customFields ? Object.fromEntries(Object.entries(input.customFields).filter(([, value]) => optionalText(value))) : detail.customFields,
    notes
  };

  await saveMappedContact(nextDetail);
  await recordContactDiffEvents({
    before: detail,
    after: nextDetail,
    source: "dashboard",
    actorUserId: input.userId,
    includeNoteEvents: true
  });

  return getDashboardContact(input.userId, input.contactId);
}

export async function createDashboardContact(input: {
  userId: string;
  siteId: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  tags?: string[];
  customFields?: Record<string, string>;
}) {
  if (!(await hasAccessibleSite(input.userId, input.siteId))) {
    throw new Error("CONTACT_SITE_FORBIDDEN");
  }

  await identifyDashboardContact({
    siteId: input.siteId,
    email: input.email,
    name: input.name,
    phone: input.phone,
    company: input.company,
    role: input.role,
    avatarUrl: input.avatarUrl,
    status: input.status,
    visitorTags: input.tags,
    customFields: input.customFields
  });
  return getDashboardContact(input.userId, encodeContactId(input.siteId, input.email));
}

export async function deleteDashboardContact(userId: string, contactId: string) {
  const detail = await getDashboardContact(userId, contactId);
  if (!detail) {
    return false;
  }

  await deleteDashboardContactRow(detail.siteId, detail.email);
  await recordContactDeletedEvent({
    contact: detail,
    actorUserId: userId
  });
  return true;
}

export async function bulkUpdateDashboardContacts(input: {
  userId: string;
  contactIds: string[];
  status?: string | null;
  addTag?: string | null;
  deleteContacts?: boolean;
  exportContacts?: boolean;
  exportFieldKeys?: string[];
}) {
  const updated: ContactDetail[] = [];

  if (input.exportContacts) {
    const contacts = (await Promise.all(
      input.contactIds.map((contactId) => getDashboardContact(input.userId, contactId))
    )).filter((contact): contact is ContactDetail => Boolean(contact));
    if (!contacts.length) {
      return contacts;
    }
    const workspace = await getWorkspaceAccess(input.userId);

    await recordContactExportEvent({
      ownerUserId: workspace.ownerUserId,
      actorUserId: input.userId,
      contactIds: contacts.map((contact) => contact.id),
      fieldKeys: input.exportFieldKeys ?? [],
      siteIds: contacts.map((contact) => contact.siteId)
    });

    return contacts;
  }

  for (const contactId of input.contactIds) {
    if (input.deleteContacts) {
      await deleteDashboardContact(input.userId, contactId);
      continue;
    }

    const contact = await getDashboardContact(input.userId, contactId);
    if (!contact) {
      continue;
    }

    const next = await updateDashboardContact({
      userId: input.userId,
      contactId,
      status: optionalText(input.status) ?? contact.status,
      tags: input.addTag ? mergeDistinctValues([...contact.tags, input.addTag]) : contact.tags
    });
    if (next) {
      updated.push(next);
    }
  }

  return updated;
}
