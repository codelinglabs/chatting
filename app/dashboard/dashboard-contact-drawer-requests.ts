"use client";

import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactConversationHistoryEntry,
  ContactCustomFieldDefinition,
  ContactDetail,
  ContactStatusDefinition
} from "@/lib/contact-types";

export type ContactDetailResponse = {
  ok: boolean;
  contact?: ContactDetail;
  settings?: {
    statuses: ContactStatusDefinition[];
    customFields: ContactCustomFieldDefinition[];
  };
};

export type ContactConversationsResponse = {
  ok: boolean;
  conversations?: ContactConversationHistoryEntry[];
};

export type ContactSettingsResponse = {
  ok: boolean;
  settings?: {
    statuses: ContactStatusDefinition[];
    customFields: ContactCustomFieldDefinition[];
  };
  planKey?: BillingPlanKey;
  error?: string;
};

export async function fetchDashboardContact(contactId: string) {
  const response = await fetch(`/api/contacts/${encodeURIComponent(contactId)}`, {
    method: "GET",
    cache: "no-store"
  });
  return {
    response,
    payload: (await response.json()) as ContactDetailResponse
  };
}

export async function fetchDashboardContactConversations(contactId: string) {
  const response = await fetch(
    `/api/contacts/${encodeURIComponent(contactId)}/conversations`,
    { method: "GET", cache: "no-store" }
  );
  return {
    response,
    payload: (await response.json()) as ContactConversationsResponse
  };
}

export async function patchDashboardContact(
  contactId: string,
  payload: Record<string, unknown>
) {
  const response = await fetch(`/api/contacts/${encodeURIComponent(contactId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return {
    response,
    payload: (await response.json()) as {
      ok: boolean;
      contact?: ContactDetail;
      error?: string;
    }
  };
}

export async function patchDashboardContactSettings(
  payload: Record<string, unknown>
) {
  const response = await fetch("/api/contacts/settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return {
    response,
    payload: (await response.json()) as ContactSettingsResponse
  };
}
