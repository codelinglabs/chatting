"use client";

import type { ConversationResumeIdentity } from "@/lib/conversation-resume-types";
import type { MessageAttachment } from "@/lib/types";

type PublicConversationReplyPayload = {
  ok: true;
  conversationId: string;
  message: {
    id: string;
    content: string;
    createdAt: string;
    attachments: MessageAttachment[];
  };
};

export function createOptimisticConversationAttachments(files: File[]) {
  return files.map((file) => ({
    id: `optimistic-attachment-${crypto.randomUUID()}`,
    fileName: file.name || "Attachment",
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size || 0,
    url: window.URL.createObjectURL(file),
    isImage: (file.type || "").startsWith("image/")
  })) satisfies MessageAttachment[];
}

export function revokeOptimisticConversationAttachments(attachments: MessageAttachment[]) {
  window.setTimeout(() => {
    attachments.forEach((attachment) => {
      if (attachment.url.startsWith("blob:")) {
        window.URL.revokeObjectURL(attachment.url);
      }
    });
  }, 0);
}

export async function postPublicConversationReply(input: {
  identity: ConversationResumeIdentity;
  content: string;
  attachments: File[];
  pageUrl: string;
}) {
  const formData = new FormData();
  formData.set("siteId", input.identity.siteId);
  formData.set("sessionId", input.identity.sessionId);
  formData.set("conversationId", input.identity.conversationId);
  formData.set("content", input.content);
  formData.set("pageUrl", input.pageUrl);
  input.attachments.forEach((attachment) => formData.append("attachments", attachment));

  const response = await fetch("/api/public/messages", {
    method: "POST",
    body: formData
  });
  const payload = (await response.json()) as PublicConversationReplyPayload | { error?: string };

  if (!response.ok || !("ok" in payload && payload.ok)) {
    throw new Error(("error" in payload && payload.error) || "Unable to store message.");
  }

  return payload;
}
