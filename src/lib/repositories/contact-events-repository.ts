import type { ContactEventType } from "@/lib/contact-event-types";
import { query } from "@/lib/db";

export async function insertContactEvent(input: {
  id: string;
  ownerUserId: string;
  siteId?: string | null;
  contactEmail?: string | null;
  eventType: ContactEventType;
  actorUserId?: string | null;
  metadataJson?: Record<string, unknown>;
}) {
  await query(
    `
      INSERT INTO contact_events (
        id,
        owner_user_id,
        site_id,
        contact_email,
        event_type,
        actor_user_id,
        metadata_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [
      input.id,
      input.ownerUserId,
      input.siteId ?? null,
      input.contactEmail ?? null,
      input.eventType,
      input.actorUserId ?? null,
      JSON.stringify(input.metadataJson ?? {})
    ]
  );
}
