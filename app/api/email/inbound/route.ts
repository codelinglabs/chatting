import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addInboundReply, getConversationNotificationContext } from "@/lib/data";
import { publishConversationLive } from "@/lib/live-events";
import { previewIncomingMessage } from "@/lib/notification-utils";
import { notifyIncomingVisitorMessage } from "@/lib/team-notifications";

type ResendReceivedEvent = {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    reply_to?: string[];
    subject?: string;
    message_id?: string;
  };
};

function getMailer() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function extractConversationId(addresses: string[]) {
  for (const address of addresses) {
    const match = address.match(/reply\+([a-f0-9-]+)@/i);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function extractSenderEmail(value: string) {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? null;
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function stripQuotedReply(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const trimmed: string[] = [];

  for (const line of lines) {
    const normalized = line.trim();

    if (
      normalized.startsWith(">") ||
      /^On .+wrote:$/i.test(normalized) ||
      normalized === "--- Original Message ---" ||
      /^From:\s/i.test(normalized) ||
      /^Sent:\s/i.test(normalized) ||
      /^To:\s/i.test(normalized) ||
      /^Subject:\s/i.test(normalized)
    ) {
      break;
    }

    trimmed.push(line);
  }

  return trimmed.join("\n").trim();
}

async function verifyAndParseEvent(request: Request) {
  const payload = await request.text();
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();

  if (!id || !timestamp || !signature) {
    throw new Error("Missing Resend webhook signature headers.");
  }

  if (!webhookSecret) {
    throw new Error("RESEND_WEBHOOK_SECRET is not configured.");
  }

  const resend = getMailer();

  return resend.webhooks.verify({
    payload,
    headers: {
      id,
      timestamp,
      signature
    },
    webhookSecret
  }) as ResendReceivedEvent;
}

async function extractReplyBody(event: ResendReceivedEvent) {
  const resend = getMailer();
  const { data, error } = await resend.emails.receiving.get(event.data.email_id);

  if (error || !data) {
    throw new Error("Unable to fetch received email content from Resend.");
  }

  const text =
    data.text?.trim() ||
    (typeof data.html === "string" ? stripHtml(data.html) : "");
  const cleaned = stripQuotedReply(text);

  if (!cleaned) {
    throw new Error("Unable to extract reply body from inbound email.");
  }

  return cleaned;
}

export async function POST(request: Request) {
  try {
    const event = await verifyAndParseEvent(request);

    if (event.type !== "email.received") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const conversationId = extractConversationId([
      ...event.data.to,
      ...(event.data.cc ?? []),
      ...(event.data.reply_to ?? [])
    ]);

    if (!conversationId) {
      return jsonError("No conversation alias found.");
    }

    const body = await extractReplyBody(event);
    const from = extractSenderEmail(event.data.from);

    const message = await addInboundReply(conversationId, from, body);
    const context = await getConversationNotificationContext(conversationId);

    publishConversationLive(conversationId, {
      type: "message.created",
      conversationId,
      sender: "user",
      createdAt: message.createdAt
    });
    publishConversationLive(conversationId, {
      type: "conversation.updated",
      conversationId,
      status: "open",
      updatedAt: message.createdAt
    });

    if (context) {
      const summary = context.summary;

      await notifyIncomingVisitorMessage({
        userId: context.userId,
        conversationId,
        createdAt: message.createdAt,
        preview: previewIncomingMessage(body, 0),
        siteName: context.siteName,
        visitorLabel: summary?.email ?? from,
        pageUrl: summary?.pageUrl ?? null,
        location: [summary?.city, summary?.region, summary?.country].filter(Boolean).join(", ") || null,
        attachmentsCount: 0,
        isNewConversation: false,
        isNewVisitor: false,
        highIntent: false
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("resend inbound error", error);
    const message =
      error instanceof Error ? error.message : "Unable to process inbound email.";

    return jsonError(message);
  }
}
