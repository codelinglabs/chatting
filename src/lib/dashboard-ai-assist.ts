import type { ConversationThread } from "@/lib/types";
import { DASHBOARD_TAGS } from "@/lib/dashboard-tags";

export type DashboardAiAssistAction = "summarize" | "rewrite" | "reply" | "tags";

export type DashboardAiAssistResult =
  | { action: "summarize"; summary: string; focus: string }
  | { action: "rewrite" | "reply"; draft: string }
  | { action: "tags"; tags: string[]; summary: string };

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clip(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}

function transcriptForConversation(conversation: ConversationThread) {
  return conversation.messages.slice(-10).map((message) => {
    const speaker = message.sender === "user" ? "Visitor" : "Teammate";
    const body = clip(message.content.trim() || "[Attachment only]", 800);
    return `${speaker}: ${body}`;
  }).join("\n");
}

export function validateDashboardAiAssistRequest(input: {
  action: string;
  conversationId: string;
  draft?: string;
}) {
  if (!input.conversationId.trim()) {
    return "missing-fields";
  }

  if (!["summarize", "rewrite", "reply", "tags"].includes(input.action)) {
    return "unknown-action";
  }

  if (input.action === "rewrite" && !readString(input.draft)) {
    return "draft-required";
  }

  return null;
}

export function buildDashboardAiAssistPrompt(input: {
  action: DashboardAiAssistAction;
  conversation: ConversationThread;
  draft?: string;
}) {
  const context = [
    `Site: ${readString(input.conversation.siteName) || "Unknown site"}`,
    `Page: ${readString(input.conversation.pageUrl) || "Unknown page"}`,
    `Current tags: ${input.conversation.tags.join(", ") || "none"}`,
    `Conversation status: ${input.conversation.status}`,
    "",
    "Transcript:",
    transcriptForConversation(input.conversation)
  ].join("\n");

  if (input.action === "summarize") {
    return `${context}

Return JSON like:
{"summary":"two concise sentences max","focus":"one short next-step sentence"}

Rules:
- Keep it concise and operational.
- Mention the visitor's main question or blocker.
- Do not invent facts not present in the conversation.`;
  }

  if (input.action === "rewrite") {
    return `${context}

Draft to rewrite:
"""
${clip(readString(input.draft), 2000)}
"""

Return JSON like:
{"draft":"rewritten reply"}

Rules:
- Keep the meaning intact.
- Make it warm, clear, and concise.
- Keep it under 120 words.
- Do not invent unavailable features, pricing, or policy details.`;
  }

  if (input.action === "reply") {
    return `${context}

Return JSON like:
{"draft":"suggested reply"}

Rules:
- Write a human reply a small team could send right now.
- Keep it under 120 words.
- Answer only from the conversation context.
- If important context is missing, ask one short clarifying question.`;
  }

  return `${context}

Allowed tags: ${DASHBOARD_TAGS.join(", ")}

Return JSON like:
{"tags":["pricing"],"summary":"short reason"}

Rules:
- Choose at most 3 tags from the allowed list.
- Only include tags clearly supported by the conversation.
- Do not return tags already present if no new tags are needed.`;
}

export function parseDashboardAiAssistResult(
  action: DashboardAiAssistAction,
  text: string
): DashboardAiAssistResult {
  const parsed = JSON.parse(text) as Record<string, unknown>;

  if (action === "summarize") {
    const summary = clip(readString(parsed.summary), 280);
    const focus = clip(readString(parsed.focus), 160);
    if (!summary || !focus) {
      throw new Error("INVALID_DASHBOARD_AI_ASSIST_RESPONSE");
    }

    return { action, summary, focus };
  }

  if (action === "rewrite" || action === "reply") {
    const draft = clip(readString(parsed.draft), 2000);
    if (!draft) {
      throw new Error("INVALID_DASHBOARD_AI_ASSIST_RESPONSE");
    }

    return { action, draft };
  }

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.map(readString).filter((tag) => DASHBOARD_TAGS.includes(tag as (typeof DASHBOARD_TAGS)[number]))
    : [];
  const uniqueTags = tags.filter((tag, index) => tags.indexOf(tag) === index).slice(0, 3);
  const summary = clip(readString(parsed.summary), 180);

  return {
    action,
    tags: uniqueTags,
    summary: summary || "Suggested tags based on the visitor's question."
  };
}
