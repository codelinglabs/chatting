import {
  deleteConversationTag,
  deleteConversationTypingRecord,
  deleteVisitorTypingRecord,
  findActiveConversationTyping,
  findConversationById,
  findConversationEmailById,
  findConversationEmailStateForUser,
  findConversationIdentityForActivity,
  findConversationNotificationContextRow,
  findConversationTag,
  findPublicAttachmentRecord,
  findVisitorConversationEmailState,
  insertConversationTag,
  updateConversationStatusRecord,
  updateVisitorConversationEmailRecord,
  upsertConversationFeedback,
  upsertConversationRead,
  upsertConversationTypingRecord,
  upsertVisitorTypingRecord
} from "@/lib/repositories/conversations-repository";
import type { ConversationRating, ConversationStatus, ConversationThread, VisitorActivity } from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { isHighIntentPage, previewIncomingMessage } from "@/lib/notification-utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { getSiteByPublicId } from "./sites";
import { migrateVisitorNoteIdentity } from "./visitor-notes";
import { recordVisitorPresence } from "./visitors";
import {
  ensureConversation,
  getConversationVisitorActivity,
  getPublicConversationAccess,
  hasPreviousVisitorConversation,
  insertMessage,
  loadConversationMessages,
  upsertMetadata
} from "./conversations-internals";
import {
  hasConversationAccess,
  mapAttachment,
  mapMessage,
  mapSummary,
  queryConversationSummaries,
  updateConversationEmailValue,
  type CreateUserMessageInput,
  type UploadedAttachmentInput
} from "./shared";

export async function createUserMessage(input: CreateUserMessageInput) {
  const site = await getSiteByPublicId(input.siteId);

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  const requestedConversation = input.conversationId?.trim()
    ? await findConversationById(input.conversationId.trim())
    : null;

  const { conversationId, createdConversation, emailCaptured } = await ensureConversation(input);
  const isNewVisitor = createdConversation
    ? !(await hasPreviousVisitorConversation({
        siteId: input.siteId,
        conversationId,
        email: input.email,
        sessionId: input.sessionId
      }))
    : false;
  await migrateVisitorNoteIdentity({
    siteId: input.siteId,
    sessionId: input.sessionId,
    previousEmail:
      requestedConversation && requestedConversation.site_id === input.siteId
        ? requestedConversation.email
        : null,
    nextEmail: input.email
  });
  await upsertMetadata(conversationId, input.metadata);
  await recordVisitorPresence({
    siteId: input.siteId,
    sessionId: input.sessionId,
    conversationId,
    email: input.email,
    pageUrl: input.metadata.pageUrl,
    referrer: input.metadata.referrer,
    userAgent: input.metadata.userAgent,
    country: input.metadata.country,
    region: input.metadata.region,
    city: input.metadata.city,
    timezone: input.metadata.timezone,
    locale: input.metadata.locale
  });
  const message = await insertMessage(
    conversationId,
    "user",
    input.content,
    input.attachments,
    { reopenConversation: true }
  );
  const summary = await getConversationSummaryById(conversationId, site.userId);
  const preview = previewIncomingMessage(input.content, input.attachments?.length ?? 0);

  return {
    conversationId,
    message,
    siteUserId: site.userId,
    siteName: site.name,
    preview,
    pageUrl: summary?.pageUrl ?? input.metadata.pageUrl ?? null,
    location: [summary?.city, summary?.region, summary?.country].filter(Boolean).join(", ") || null,
    visitorLabel: summary?.email ?? optionalText(input.email),
    isNewConversation: createdConversation,
    isNewVisitor,
    highIntent: createdConversation && isHighIntentPage(summary?.pageUrl ?? input.metadata.pageUrl ?? null),
    welcomeEmailEligible: emailCaptured
  };
}

export async function getPublicConversationMessages(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return null;
  }

  return loadConversationMessages(
    input.conversationId,
    (attachmentId) =>
      `/api/files/${attachmentId}?conversationId=${encodeURIComponent(input.conversationId)}&siteId=${encodeURIComponent(input.siteId)}&sessionId=${encodeURIComponent(input.sessionId)}`
  );
}

export async function getPublicConversationTypingStatus(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return null;
  }

  return {
    teamTyping: await findActiveConversationTyping(input.conversationId)
  };
}

export async function saveVisitorConversationEmail(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
  email: string;
}) {
  const email = optionalText(input.email);

  if (!email) {
    throw new Error("EMAIL_REQUIRED");
  }

  const before = await findVisitorConversationEmailState({
    conversationId: input.conversationId,
    siteId: input.siteId,
    sessionId: input.sessionId
  });

  if (!before) {
    return {
      updated: false,
      welcomeEmailEligible: false,
      ownerUserId: null
    };
  }

  const updated = await updateVisitorConversationEmailRecord({
    conversationId: input.conversationId,
    siteId: input.siteId,
    sessionId: input.sessionId,
    email
  });

  if (updated) {
    await migrateVisitorNoteIdentity({
      siteId: input.siteId,
      sessionId: input.sessionId,
      previousEmail: before.email,
      nextEmail: email
    });
    await recordVisitorPresence({
      siteId: input.siteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      email
    });
  }

  return {
    updated,
    welcomeEmailEligible: !optionalText(before.email),
    ownerUserId: before.user_id
  };
}

export async function addFounderReply(
  conversationId: string,
  content: string,
  userId: string,
  attachments: UploadedAttachmentInput[] = []
) {
  if (!(await hasConversationAccess(conversationId, userId))) {
    return false;
  }

  return insertMessage(conversationId, "founder", content, attachments);
}

export async function addInboundReply(conversationId: string, email: string | null, content: string) {
  const conversation = await findConversationById(conversationId);
  if (conversation) {
    await migrateVisitorNoteIdentity({
      siteId: conversation.site_id,
      sessionId: conversation.session_id,
      previousEmail: conversation.email,
      nextEmail: email
    });
  }

  await updateConversationEmailValue(conversationId, email, "merge");
  return insertMessage(conversationId, "user", content, [], { reopenConversation: true });
}

export async function getConversationNotificationContext(conversationId: string) {
  const context = await findConversationNotificationContextRow(conversationId);
  if (!context) {
    return null;
  }

  const summary = await getConversationSummaryById(conversationId, context.user_id);

  return {
    userId: context.user_id,
    siteName: context.site_name,
    summary
  };
}

export async function listConversationSummaries(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const result = await queryConversationSummaries(
    "s.user_id = $1",
    [workspace.ownerUserId],
    "ORDER BY latest.created_at DESC NULLS LAST, c.updated_at DESC",
    userId
  );

  return result.rows.map(mapSummary);
}

export async function getConversationSummaryById(id: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const result = await queryConversationSummaries(
    "c.id = $1 AND s.user_id = $2",
    [id, workspace.ownerUserId],
    "LIMIT 1",
    userId
  );

  return result.rowCount ? mapSummary(result.rows[0]) : null;
}

export async function getConversationById(id: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const [summaryResult, visitorActivity] = await Promise.all([
    queryConversationSummaries("c.id = $1 AND s.user_id = $2", [id, workspace.ownerUserId], "LIMIT 1", userId),
    getConversationVisitorActivity(id, userId)
  ]);

  if (!summaryResult.rowCount || !visitorActivity) {
    return null;
  }

  const messages = await loadConversationMessages(
    id,
    (attachmentId) => `/api/files/${attachmentId}?conversationId=${encodeURIComponent(id)}`
  );

  return {
    ...mapSummary(summaryResult.rows[0]),
    messages,
    visitorActivity
  } satisfies ConversationThread;
}

export async function toggleTag(conversationId: string, tag: string, userId: string) {
  if (!(await hasConversationAccess(conversationId, userId))) {
    return false;
  }

  const normalizedTag = tag.trim().toLowerCase();
  if (await findConversationTag(conversationId, normalizedTag)) {
    await deleteConversationTag(conversationId, normalizedTag);
    return true;
  }

  await insertConversationTag(conversationId, normalizedTag);

  return true;
}

export async function recordFeedback(conversationId: string, rating: ConversationRating) {
  await upsertConversationFeedback(conversationId, rating);
}

export async function updateConversationEmail(conversationId: string, email: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);

  if (!(await hasConversationAccess(conversationId, userId))) {
    return {
      updated: false,
      welcomeEmailEligible: false
    };
  }

  const previousEmail = await findConversationEmailById(conversationId);
  const identityBefore = await findConversationIdentityForActivity(conversationId, workspace.ownerUserId);

  await updateConversationEmailValue(conversationId, email, "replace");
  if (identityBefore) {
    await migrateVisitorNoteIdentity({
      siteId: identityBefore.site_id,
      sessionId: identityBefore.session_id,
      previousEmail,
      nextEmail: email,
      updatedByUserId: userId
    });
  }
  return {
    updated: true,
    welcomeEmailEligible: !optionalText(previousEmail)
  };
}

export async function getConversationEmail(conversationId: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return findConversationEmailStateForUser(conversationId, workspace.ownerUserId);
}

export async function markConversationRead(conversationId: string, userId: string) {
  if (!(await hasConversationAccess(conversationId, userId))) {
    return false;
  }

  await upsertConversationRead(userId, conversationId);

  return true;
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
  userId: string
) {
  const workspace = await getWorkspaceAccess(userId);
  return updateConversationStatusRecord(conversationId, workspace.ownerUserId, status);
}

export async function getAttachmentForPublic(input: {
  attachmentId: string;
  conversationId: string;
  siteId: string;
  sessionId: string;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return null;
  }

  return findPublicAttachmentRecord(input.attachmentId, input.conversationId);
}

export async function getAttachmentForUser(input: {
  attachmentId: string;
  conversationId: string;
  userId: string;
}) {
  if (!(await hasConversationAccess(input.conversationId, input.userId))) {
    return null;
  }

  return findPublicAttachmentRecord(input.attachmentId, input.conversationId);
}

export async function updateConversationTyping(input: {
  conversationId: string;
  userId: string;
  typing: boolean;
}) {
  if (!(await hasConversationAccess(input.conversationId, input.userId))) {
    return false;
  }

  if (!input.typing) {
    await deleteConversationTypingRecord(input.userId, input.conversationId);
    return true;
  }

  await upsertConversationTypingRecord(input.userId, input.conversationId);

  return true;
}

export async function updateVisitorTyping(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
  typing: boolean;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return false;
  }

  if (!input.typing) {
    await deleteVisitorTypingRecord(input.conversationId, input.sessionId);
    return true;
  }

  await upsertVisitorTypingRecord(input.conversationId, input.sessionId);

  return true;
}
