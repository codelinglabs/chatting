import { query } from "@/lib/db";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type { DashboardEmailTemplateKey } from "@/lib/email-templates";

export async function findConversationTemplateContext(conversationId: string) {
  const result = await query<{
    conversation_id: string;
    site_id: string;
    session_id: string;
    user_id: string;
    site_name: string;
    email: string | null;
    plan_key: BillingPlanKey | null;
  }>(
    `
      SELECT
        c.id AS conversation_id,
        c.site_id,
        c.session_id,
        s.user_id,
        s.name AS site_name,
        c.email,
        ba.plan_key
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      LEFT JOIN billing_accounts ba
        ON ba.user_id = s.user_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [conversationId]
  );

  return result.rows[0] ?? null;
}

export async function listConversationTranscriptRows(conversationId: string) {
  const result = await query<{
    id: string;
    sender: "user" | "founder";
    content: string;
    created_at: string;
  }>(
    `
      SELECT id, sender, content, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `,
    [conversationId]
  );

  return result.rows;
}

export async function claimTemplateDelivery(input: {
  deliveryId: string;
  conversationId: string;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  recipientEmail: string;
}) {
  const result = await query<{ id: string }>(
    `
      INSERT INTO email_template_deliveries (
        id,
        conversation_id,
        template_key,
        delivery_key,
        recipient_email,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
      ON CONFLICT (delivery_key) DO NOTHING
      RETURNING id
    `,
    [input.deliveryId, input.conversationId, input.templateKey, input.deliveryKey, input.recipientEmail]
  );

  return Boolean(result.rowCount);
}

export async function markTemplateDeliverySent(deliveryKey: string) {
  await query(
    `
      UPDATE email_template_deliveries
      SET status = 'sent',
          sent_at = NOW()
      WHERE delivery_key = $1
    `,
    [deliveryKey]
  );
}

export async function deletePendingTemplateDelivery(deliveryKey: string) {
  await query(
    `
      DELETE FROM email_template_deliveries
      WHERE delivery_key = $1
        AND status = 'pending'
    `,
    [deliveryKey]
  );
}
