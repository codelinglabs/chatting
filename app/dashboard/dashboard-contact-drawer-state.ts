"use client";

import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactCustomFieldDefinition,
  ContactDetail,
  ContactStatusDefinition
} from "@/lib/contact-types";

export type SavePatchOptions = {
  optimisticDetail?: ContactDetail | null;
  previousDetail?: ContactDetail | null;
};

export type SaveSettingsOptions = {
  optimisticSettings?: {
    statuses: ContactStatusDefinition[];
    customFields: ContactCustomFieldDefinition[];
    planKey: BillingPlanKey;
  };
};

export const DEFAULT_CONTACT_PLAN_KEY: BillingPlanKey = "starter";
export const EMPTY_PROFILE_DRAFT = { name: "", phone: "", company: "", role: "" };
export const EMPTY_LOCATION_DRAFT = { city: "", region: "", country: "" };

export function buildProfileDraft(detail: ContactDetail | null) {
  return detail
    ? {
        name: detail.name,
        phone: detail.phone ?? "",
        company: detail.company ?? "",
        role: detail.role ?? ""
      }
    : EMPTY_PROFILE_DRAFT;
}

export function buildLocationDraft(detail: ContactDetail | null) {
  return detail
    ? {
        city: detail.location.city ?? "",
        region: detail.location.region ?? "",
        country: detail.location.country ?? ""
      }
    : EMPTY_LOCATION_DRAFT;
}
