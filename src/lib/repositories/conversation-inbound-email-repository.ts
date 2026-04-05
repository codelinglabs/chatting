import { query } from "@/lib/db";

export async function listInboundReplyAuthorizedEmails(conversationId: string) {
  const result = await query<{ email: string }>(
    `
      SELECT DISTINCT LOWER(source.email) AS email
      FROM (
        SELECT c.email
        FROM conversations c
        WHERE c.id = $1
          AND c.email IS NOT NULL

        UNION

        SELECT etd.recipient_email AS email
        FROM email_template_deliveries etd
        WHERE etd.conversation_id = $1
          AND etd.status = 'sent'
      ) source
      WHERE source.email IS NOT NULL
      ORDER BY LOWER(source.email) ASC
    `,
    [conversationId]
  );

  return result.rows.map((row) => row.email);
}
