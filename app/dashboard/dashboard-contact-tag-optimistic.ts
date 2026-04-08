"use client";

import type { ContactDetail } from "@/lib/contact-types";

export function buildOptimisticContactTagAddition(
  contact: ContactDetail,
  draftTag: string
) {
  const tag = draftTag.trim().toLowerCase();
  if (!tag) {
    return null;
  }

  return {
    ...contact,
    tags: Array.from(new Set([...contact.tags, tag]))
  };
}

export function buildOptimisticContactTagRemoval(
  contact: ContactDetail,
  tag: string
) {
  return {
    ...contact,
    tags: contact.tags.filter((entry) => entry !== tag)
  };
}
