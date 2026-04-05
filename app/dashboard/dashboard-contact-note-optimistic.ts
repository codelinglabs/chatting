"use client";

import type { ContactDetail, ContactNote } from "@/lib/contact-types";

export function buildOptimisticContactNote(body: string, now = new Date().toISOString()): ContactNote {
  const optimisticId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;

  return {
    id: `optimistic-contact-note-${optimisticId}`,
    body: body.trim(),
    authorUserId: "optimistic",
    authorName: "You",
    createdAt: now,
    updatedAt: now
  };
}

export function addOptimisticContactNote(detail: ContactDetail, body: string, now = new Date().toISOString()) {
  const note = buildOptimisticContactNote(body, now);
  return {
    ...detail,
    notes: [note, ...detail.notes]
  } satisfies ContactDetail;
}
