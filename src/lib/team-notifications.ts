import { getDashboardNotificationDeliverySettings } from "@/lib/data";
import { sendTeamNewMessageEmail } from "@/lib/email";
import { maybeSendAnalyticsExpansionEmail } from "@/lib/growth-outreach";
import { publishDashboardLive } from "@/lib/live-events";

type IncomingVisitorMessageNotificationInput = {
  userId: string;
  conversationId: string;
  createdAt: string;
  preview: string;
  siteName: string;
  visitorLabel: string | null;
  pageUrl: string | null;
  location: string | null;
  attachmentsCount: number;
  isNewConversation: boolean;
  isNewVisitor: boolean;
  highIntent: boolean;
};

export async function notifyIncomingVisitorMessage(
  input: IncomingVisitorMessageNotificationInput
) {
  publishDashboardLive(input.userId, {
    type: "message.created",
    conversationId: input.conversationId,
    sender: "user",
    createdAt: input.createdAt,
    preview: input.preview,
    pageUrl: input.pageUrl,
    location: input.location,
    siteName: input.siteName,
    visitorLabel: input.visitorLabel,
    isNewConversation: input.isNewConversation,
    isNewVisitor: input.isNewVisitor,
    highIntent: input.highIntent
  });
  publishDashboardLive(input.userId, {
    type: "conversation.updated",
    conversationId: input.conversationId,
    status: "open",
    updatedAt: input.createdAt
  });

  try {
    const deliverySettings = await getDashboardNotificationDeliverySettings(input.userId);

    if (!deliverySettings.emailNotifications) {
      return;
    }

    await sendTeamNewMessageEmail({
      to: deliverySettings.notificationEmail,
      siteName: input.siteName,
      conversationId: input.conversationId,
      content: input.preview,
      visitorEmail: input.visitorLabel,
      pageUrl: input.pageUrl,
      attachmentsCount: input.attachmentsCount
    });

    if (input.isNewConversation) {
      await maybeSendAnalyticsExpansionEmail(input.userId);
    }
  } catch (notificationError) {
    console.error("team new message email failed", notificationError);
  }
}
