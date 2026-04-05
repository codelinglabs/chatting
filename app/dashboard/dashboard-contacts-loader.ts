"use client";

import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactCustomFieldDefinition,
  ContactDetail,
  ContactListPayload,
  ContactStatusDefinition
} from "@/lib/contact-types";

let cachedPayload: ContactListPayload | null = null;
let inflightPayload: Promise<ContactListPayload> | null = null;

function updateCachedPayload(
  updater: (payload: ContactListPayload) => ContactListPayload
) {
  if (!cachedPayload) {
    return;
  }

  cachedPayload = updater(cachedPayload);
}

export function getCachedContactsPayload() {
  return cachedPayload;
}

export async function loadContactsPayload(force = false) {
  if (force) {
    cachedPayload = null;
    inflightPayload = null;
  }

  if (cachedPayload) {
    return cachedPayload;
  }

  if (inflightPayload) {
    return inflightPayload;
  }

  inflightPayload = fetch("/api/contacts", { method: "GET", cache: "no-store" })
    .then(async (response) => {
      const result = (await response.json()) as ContactListPayload & { ok?: boolean };
      if (!response.ok) {
        throw new Error("Unable to load contacts.");
      }

      cachedPayload = result;
      return result;
    })
    .finally(() => {
      inflightPayload = null;
    });

  return inflightPayload;
}

export function replaceCachedContact(contact: ContactDetail) {
  updateCachedPayload((payload) => ({
    ...payload,
    contacts: payload.contacts.map((entry) =>
      entry.id === contact.id ? contact : entry
    )
  }));
}

export function replaceCachedContactSettings(input: {
  statuses: ContactStatusDefinition[];
  customFields: ContactCustomFieldDefinition[];
  planKey?: BillingPlanKey;
}) {
  updateCachedPayload((payload) => ({
    ...payload,
    settings: {
      ...payload.settings,
      statuses: input.statuses,
      customFields: input.customFields
    },
    ...(input.planKey ? { planKey: input.planKey } : {})
  }));
}

export function resetContactsPayloadCache() {
  cachedPayload = null;
  inflightPayload = null;
}
