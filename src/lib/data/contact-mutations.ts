import type { ContactDetail } from "@/lib/contact-types";
import {
  recordContactDeletedEvent,
  recordContactDiffEvents,
  recordContactExportEvent
} from "@/lib/contact-events";
import { gravatarUrlForEmail } from "@/lib/contact-avatar";
import { encodeContactId } from "@/lib/contact-utils";
import { deleteDashboardContactRow } from "@/lib/repositories/contacts-repository";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { hasAccessibleSite } from "@/lib/data/contact-access";
import { mergeDistinctValues } from "@/lib/data/contact-normalizers";
import { resolveUpdatedContactNotes } from "@/lib/data/contact-note-updates";
import { saveMappedContact } from "@/lib/data/contact-records";
import { getDashboardContact } from "@/lib/data/contact-queries";
import { identifyDashboardContact } from "@/lib/data/contact-sync";

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

  const notes = await resolveUpdatedContactNotes({
    userId: input.userId,
    workspaceRole: workspace.role,
    notes: detail.notes,
    note: input.note,
    deleteNoteId: input.deleteNoteId
  });

  const nextDetail = {
    ...detail,
    name: optionalText(input.name) ?? detail.name,
    phone: input.phone === null ? null : optionalText(input.phone) ?? detail.phone,
    company: input.company === null ? null : optionalText(input.company) ?? detail.company,
    role: input.role === null ? null : optionalText(input.role) ?? detail.role,
    avatarUrl:
      input.avatarUrl === null
        ? gravatarUrlForEmail(detail.email)
        : optionalText(input.avatarUrl) ?? detail.avatarUrl,
    status: optionalText(input.status) ?? detail.status,
    location: {
      city: input.location?.city === null ? null : optionalText(input.location?.city) ?? detail.location.city,
      region: input.location?.region === null ? null : optionalText(input.location?.region) ?? detail.location.region,
      country: input.location?.country === null ? null : optionalText(input.location?.country) ?? detail.location.country
    },
    tags: Array.isArray(input.tags) ? mergeDistinctValues(input.tags) : detail.tags,
    customFields: input.customFields
      ? Object.fromEntries(Object.entries(input.customFields).filter(([, value]) => optionalText(value)))
      : detail.customFields,
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
