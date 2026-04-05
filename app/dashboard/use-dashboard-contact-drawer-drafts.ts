"use client";

import { useEffect, useState } from "react";
import type { ContactDetail } from "@/lib/contact-types";
import {
  buildLocationDraft,
  buildProfileDraft,
  EMPTY_LOCATION_DRAFT,
  EMPTY_PROFILE_DRAFT
} from "./dashboard-contact-drawer-state";

export function useDashboardContactDrawerDrafts(detail: ContactDetail | null) {
  const [profileDraft, setProfileDraft] = useState(EMPTY_PROFILE_DRAFT);
  const [locationDraft, setLocationDraft] = useState(EMPTY_LOCATION_DRAFT);
  const [customFieldDraft, setCustomFieldDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    setProfileDraft(buildProfileDraft(detail));
    setLocationDraft(buildLocationDraft(detail));
    setCustomFieldDraft(detail?.customFields ?? {});
  }, [detail]);

  return {
    profileDraft,
    locationDraft,
    customFieldDraft,
    setProfileDraft,
    setLocationDraft,
    setCustomFieldDraft
  };
}
