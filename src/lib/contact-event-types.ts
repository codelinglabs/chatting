export const CONTACT_EVENT_TYPES = [
  "contact.created",
  "contact.updated",
  "contact.merged",
  "contact.status_changed",
  "contact.tag_added",
  "contact.tag_removed",
  "contact.note_added",
  "contact.exported",
  "contact.deleted"
] as const;

export type ContactEventType = (typeof CONTACT_EVENT_TYPES)[number];
