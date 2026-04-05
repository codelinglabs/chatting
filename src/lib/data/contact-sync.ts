import {
  recordContactCreatedEvent,
  recordContactDiffEvents,
  recordContactMergedEvent
} from "@/lib/contact-events";
import { getContactMergeMetadata } from "@/lib/contact-event-utils";
import { findDashboardContactRow } from "@/lib/repositories/contacts-repository";
import { optionalText } from "@/lib/utils";
import {
  createEmptyContact,
  mapContactRow,
  saveMappedContact
} from "@/lib/data/contact-records";
import {
  mergeDistinctValues,
  mergePageHistory,
  updateSource
} from "@/lib/data/contact-normalizers";

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
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingBefore = await findDashboardContactRow(input.siteId, normalizedEmail);

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

  const existing = await findDashboardContactRow(input.siteId, normalizedEmail);
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
