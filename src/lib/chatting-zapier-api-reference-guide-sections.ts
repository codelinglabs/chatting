import type { BlogSection } from "@/lib/blog-types";
import { code, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingZapierApiReferenceGuideSections: BlogSection[] = [
  section("overview", "Base URL and response format", [
    list([
      "Production base URL: `https://usechatting.com/api/zapier`",
      "Authentication header: `X-API-Key: <your-api-key>`",
      "Success shape: `{ \"ok\": true, ... }`",
      "Error shape: `{ \"ok\": false, \"error\": \"<code>\" }`"
    ]),
    code(`GET /api/zapier/me\nX-API-Key: <your-api-key>\n\n200 OK\n{\n  \"ok\": true,\n  \"workspace_id\": \"owner_123\",\n  \"team_name\": \"Acme Team\",\n  \"owner_email\": \"owner@example.com\"\n}\n\n401 Unauthorized\n{\n  \"ok\": false,\n  \"error\": \"api-key-missing\"\n}`, "http")
  ]),
  section("auth", "Authentication and idempotency", [
    list([
      "Required auth header: `X-API-Key: <your-api-key>`",
      "Auth check endpoint: `GET /api/zapier/me`",
      "Missing key error: `api-key-missing`",
      "Invalid or revoked key error: `api-key-invalid`"
    ]),
    paragraph("Create-style actions also accept `Idempotency-Key` or `X-Idempotency-Key`. Reusing the same key with a different payload returns `idempotency-key-conflict`."),
    code(`X-API-Key: chatting_live_...\nIdempotency-Key: 0b0e6a45-92b4-4da0-b0a9-6e612a8d02fa`, "http")
  ]),
  section("triggers", "Trigger subscriptions and sample endpoints", [
    list([
      "Supported events: `conversation.created`, `conversation.resolved`, `contact.created`, `tag.added`",
      "Subscription endpoint: `POST /api/zapier/webhooks/subscribe`",
      "Unsubscribe endpoint: `DELETE /api/zapier/webhooks/{id}`",
      "Sample endpoints return recent records for Zapier editor mapping"
    ]),
    code(`Subscribe:           POST /api/zapier/webhooks/subscribe\nUnsubscribe:         DELETE /api/zapier/webhooks/{id}\nConversation sample: GET /api/zapier/conversations?limit=1\nResolved sample:     GET /api/zapier/conversations?limit=1&event=conversation.resolved\nTag-added sample:    GET /api/zapier/conversations?limit=1&event=tag.added\nContact sample:      GET /api/zapier/contacts?limit=1`, "endpoints"),
    code(`POST /api/zapier/webhooks/subscribe\nContent-Type: application/json\nX-API-Key: <your-api-key>\n\n{\n  \"event\": \"conversation.created\",\n  \"target_url\": \"https://hooks.zapier.com/hooks/catch/123/abc\"\n}\n\n201 Created\n{\n  \"ok\": true,\n  \"id\": \"wh_123\",\n  \"event\": \"conversation.created\",\n  \"active\": true\n}`, "http"),
    code(`DELETE /api/zapier/webhooks/wh_123\nX-API-Key: <your-api-key>\n\n200 OK\n{\n  \"ok\": true,\n  \"id\": \"wh_123\",\n  \"active\": false\n}`, "http")
  ]),
  section("actions", "Action endpoints", [
    list([
      "Create contact: `POST /api/zapier/contacts`",
      "Add tag to contact: `POST /api/zapier/contacts/{id}/tags`",
      "Send message: `POST /api/zapier/conversations/{id}/messages`"
    ]),
    code(`POST /api/zapier/contacts\nContent-Type: application/json\nX-API-Key: <your-api-key>\n\n{\n  \"email\": \"lead@example.com\",\n  \"name\": \"Ava Brooks\",\n  \"phone\": \"+1 555 111 2222\",\n  \"company\": \"Acme\",\n  \"status\": \"lead\",\n  \"tags\": [\"vip\", \"demo\"],\n  \"customFields\": {\n    \"crm_owner\": \"tina\"\n  }\n}\n\n201 Created\n{\n  \"ok\": true,\n  \"id\": \"contact_123\",\n  \"email\": \"lead@example.com\",\n  \"name\": \"Ava Brooks\",\n  \"created_at\": \"2026-04-09T00:00:00.000Z\"\n}`, "http"),
    code(`POST /api/zapier/contacts/contact_123/tags\nContent-Type: application/json\nX-API-Key: <your-api-key>\n\n{\n  \"tag\": \"vip\"\n}\n\n200 OK\n{\n  \"ok\": true,\n  \"id\": \"contact_123\",\n  \"tag\": \"vip\"\n}`, "http"),
    code(`POST /api/zapier/conversations/conv_123/messages\nContent-Type: application/json\nX-API-Key: <your-api-key>\n\n{\n  \"message\": \"Thanks, we got your message.\",\n  \"sender\": \"system\"\n}\n\n201 Created\n{\n  \"ok\": true,\n  \"id\": \"msg_123\",\n  \"conversation_id\": \"conv_123\",\n  \"sender\": \"system\",\n  \"created_at\": \"2026-04-09T00:00:00.000Z\"\n}`, "http")
  ]),
  section("errors", "Common error codes", [
    paragraph("The Zapier API keeps errors intentionally short and machine-readable so the Zapier editor can surface clear setup issues. These are the main codes to expect while building and reviewing the integration."),
    list([
      "`api-key-missing` — the `X-API-Key` header is missing",
      "`api-key-invalid` — the API key prefix exists but the key does not verify",
      "`invalid-subscription` — the trigger event or `target_url` is invalid",
      "`missing-email` — `POST /contacts` was called without an email",
      "`workspace-site-missing` — the workspace has no primary site to attach contacts to",
      "`contact-not-found` — a newly created contact could not be loaded back",
      "`contact-site-forbidden` — the contact write target is outside the workspace",
      "`contact-save-failed` — contact creation failed for a non-validation reason",
      "`missing-tag` — `POST /contacts/{id}/tags` was called without a tag",
      "`missing-message` — `POST /conversations/{id}/messages` was called without a message",
      "`not-found` — the requested contact, conversation, or webhook id does not exist",
      "`idempotency-key-conflict` — the same idempotency key was reused with a different payload"
    ])
  ]),
  section("payloads", "Sample trigger payloads", [
    paragraph("Chatting sends flattened `data__...` fields for easy Zapier mapping, plus the nested `data` object for integrations that want the original grouped structure."),
    code(`{\n  \"event\": \"conversation.created\",\n  \"timestamp\": \"2026-04-08T00:50:00.000Z\",\n  \"data__conversation_id\": \"conv_abc123\",\n  \"data__visitor_email\": \"visitor@example.com\",\n  \"data__visitor_name\": \"Ava Brooks\",\n  \"data__page_url\": \"https://www.usechatting.com/pricing\",\n  \"data__first_message\": \"Do you have a free plan?\",\n  \"data__assigned_to\": null,\n  \"data\": {\n    \"conversation_id\": \"conv_abc123\",\n    \"visitor_email\": \"visitor@example.com\",\n    \"visitor_name\": \"Ava Brooks\",\n    \"page_url\": \"https://www.usechatting.com/pricing\",\n    \"first_message\": \"Do you have a free plan?\",\n    \"tags\": [],\n    \"assigned_to\": null\n  }\n}`, "json"),
    code(`{\n  \"event\": \"conversation.resolved\",\n  \"timestamp\": \"2026-04-08T00:50:00.000Z\",\n  \"data__conversation_id\": \"conv_abc123\",\n  \"data__visitor_email\": \"visitor@example.com\",\n  \"data__resolved_by\": \"owner@usechatting.com\",\n  \"data__message_count\": 8,\n  \"data__duration_seconds\": 420,\n  \"data\": {\n    \"conversation_id\": \"conv_abc123\",\n    \"visitor_email\": \"visitor@example.com\",\n    \"resolved_by\": \"owner@usechatting.com\",\n    \"message_count\": 8,\n    \"duration_seconds\": 420\n  }\n}`, "json"),
    code(`{\n  \"event\": \"contact.created\",\n  \"timestamp\": \"2026-04-08T01:30:00.000Z\",\n  \"data__contact_id\": \"cnt_abc123\",\n  \"data__email\": \"visitor@example.com\",\n  \"data__name\": \"Ava Brooks\",\n  \"data__company\": \"Acme Corp\",\n  \"data__source\": \"chat_form\",\n  \"data\": {\n    \"contact_id\": \"cnt_abc123\",\n    \"email\": \"visitor@example.com\",\n    \"name\": \"Ava Brooks\",\n    \"company\": \"Acme Corp\",\n    \"source\": \"chat_form\"\n  }\n}`, "json"),
    code(`{\n  \"event\": \"tag.added\",\n  \"timestamp\": \"2026-04-08T02:00:00.000Z\",\n  \"data__conversation_id\": \"conv_abc123\",\n  \"data__tag\": \"vip\",\n  \"data__added_by\": \"owner@usechatting.com\",\n  \"data\": {\n    \"conversation_id\": \"conv_abc123\",\n    \"tag\": \"vip\",\n    \"added_by\": \"owner@usechatting.com\"\n  }\n}`, "json")
  ])
];
