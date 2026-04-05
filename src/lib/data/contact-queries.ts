import type { ContactDetail, ContactListPayload } from "@/lib/contact-types";
import { listDashboardContactRows } from "@/lib/repositories/contacts-repository";
import {
  listDashboardContactTagOptions as listDashboardContactTagOptionsRows
} from "@/lib/repositories/contacts-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import {
  loadConversationHistory,
  resolveAccessibleContactContext,
  resolveContactSettings
} from "@/lib/data/contact-access";
import { buildContactTagOptions } from "@/lib/data/contact-normalizers";
import { mapContactRow } from "@/lib/data/contact-records";

export async function listDashboardContacts(userId: string): Promise<ContactListPayload> {
  const { workspace, planKey, settings, limits } = await resolveContactSettings(userId);
  const rows = await listDashboardContactRows(workspace.ownerUserId, userId);
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
