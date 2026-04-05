import type { ContactDetail } from "@/lib/contact-types";
import { gravatarUrlForEmail } from "@/lib/contact-avatar";
import { contactDisplayName, encodeContactId } from "@/lib/contact-utils";
import {
  saveDashboardContactRow,
  type DashboardContactRow
} from "@/lib/repositories/contacts-repository";
import { optionalText } from "@/lib/utils";
import { parseContactNotes, parsePageHistory } from "@/lib/data/contact-normalizers";

export type PersistedContactInput = Pick<
  ContactDetail,
  | "siteId"
  | "email"
  | "latestConversationId"
  | "latestSessionId"
  | "tags"
  | "customFields"
  | "firstSeenAt"
  | "lastSeenAt"
  | "name"
  | "phone"
  | "company"
  | "role"
  | "avatarUrl"
  | "status"
  | "location"
  | "source"
  | "notes"
  | "pageHistory"
  | "totalPageViews"
>;

export function mapContactRow(row: DashboardContactRow) {
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

export function createEmptyContact(siteId: string, email: string, seenAt: string) {
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

export async function saveMappedContact(input: PersistedContactInput) {
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
