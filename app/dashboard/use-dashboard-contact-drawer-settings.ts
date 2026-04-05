"use client";

import { useEffect, useState } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactCustomFieldDefinition,
  ContactStatusDefinition
} from "@/lib/contact-types";
import { DEFAULT_CONTACT_PLAN_KEY } from "./dashboard-contact-drawer-state";

export function useDashboardContactDrawerSettings({
  initialStatuses,
  initialCustomFields,
  initialPlanKey,
  initialTagOptions
}: {
  initialStatuses?: ContactStatusDefinition[];
  initialCustomFields?: ContactCustomFieldDefinition[];
  initialPlanKey?: BillingPlanKey;
  initialTagOptions?: string[];
}) {
  const [planKey, setPlanKey] = useState<BillingPlanKey>(
    initialPlanKey ?? DEFAULT_CONTACT_PLAN_KEY
  );
  const [statuses, setStatuses] = useState<ContactStatusDefinition[]>(initialStatuses ?? []);
  const [customFields, setCustomFields] = useState<ContactCustomFieldDefinition[]>(
    initialCustomFields ?? []
  );
  const [tagOptions, setTagOptions] = useState<string[]>(initialTagOptions ?? []);

  function applySettings(next: {
    statuses: ContactStatusDefinition[];
    customFields: ContactCustomFieldDefinition[];
    planKey: BillingPlanKey;
    tagOptions?: string[];
  }) {
    setStatuses(next.statuses);
    setCustomFields(next.customFields);
    setPlanKey(next.planKey);
    if (next.tagOptions) setTagOptions(next.tagOptions);
  }

  useEffect(() => {
    applySettings({
      statuses: initialStatuses ?? [],
      customFields: initialCustomFields ?? [],
      planKey: initialPlanKey ?? DEFAULT_CONTACT_PLAN_KEY,
      tagOptions: initialTagOptions ?? []
    });
  }, [initialCustomFields, initialPlanKey, initialStatuses, initialTagOptions]);

  return { planKey, statuses, customFields, tagOptions, applySettings };
}
