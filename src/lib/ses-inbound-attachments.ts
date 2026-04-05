import type { UploadedAttachmentInput } from "@/lib/data/shared";
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES
} from "@/lib/conversation-io";

export type ParsedMailAttachment = {
  filename?: string | null;
  contentType?: string | null;
  contentDisposition?: string | null;
  contentId?: string | null;
  related?: boolean | null;
  size?: number | null;
  content?: Buffer | Uint8Array | ArrayBuffer | null;
};

function toBuffer(content: ParsedMailAttachment["content"]) {
  if (!content) {
    return null;
  }

  if (Buffer.isBuffer(content)) {
    return content;
  }

  if (content instanceof Uint8Array) {
    return Buffer.from(content);
  }

  if (content instanceof ArrayBuffer) {
    return Buffer.from(content);
  }

  return null;
}

function shouldKeepAttachment(attachment: ParsedMailAttachment) {
  const disposition = attachment.contentDisposition?.trim().toLowerCase() ?? "";
  const fileName = attachment.filename?.trim() ?? "";
  const hasContentId = Boolean(attachment.contentId?.trim());

  if (disposition === "attachment") {
    return true;
  }

  if (disposition === "inline" || attachment.related || hasContentId) {
    return false;
  }

  return Boolean(fileName);
}

export function parseInboundAttachments(
  attachments: ParsedMailAttachment[] = []
): UploadedAttachmentInput[] {
  const normalized: UploadedAttachmentInput[] = [];

  for (const attachment of attachments) {
    if (normalized.length >= MAX_ATTACHMENT_COUNT || !shouldKeepAttachment(attachment)) {
      continue;
    }

    const content = toBuffer(attachment.content);
    const sizeBytes = Number(attachment.size ?? content?.byteLength ?? 0);

    if (!content?.byteLength || sizeBytes <= 0 || sizeBytes > MAX_ATTACHMENT_SIZE_BYTES) {
      continue;
    }

    normalized.push({
      fileName: attachment.filename?.trim() || `attachment-${normalized.length + 1}`,
      contentType: attachment.contentType?.trim() || "application/octet-stream",
      sizeBytes,
      content
    });
  }

  return normalized;
}
