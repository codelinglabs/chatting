import { bindMobilePushRegistrationsToConversationRow, disableMobilePushRegistrationRow, upsertMobilePushRegistrationRow } from "@/lib/repositories/mobile-push-repository";
import { optionalText } from "@/lib/utils";
import { getPublicConversationState } from "./conversations";

export async function registerPublicMobilePushDevice(input: {
  siteId: string;
  sessionId: string;
  conversationId: string | null;
  pushToken: string;
  platform?: string | null;
  appId?: string | null;
}) {
  const pushToken = optionalText(input.pushToken);
  if (!pushToken) {
    throw new Error("PUSH_TOKEN_REQUIRED");
  }

  if (input.conversationId) {
    const conversation = await getPublicConversationState({
      siteId: input.siteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId
    });

    if (!conversation) {
      return { ok: false as const, error: "CONVERSATION_NOT_FOUND" as const };
    }
  }

  await upsertMobilePushRegistrationRow({
    id: createMobilePushRegistrationId(),
    siteId: input.siteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    provider: "expo",
    platform: optionalText(input.platform),
    appId: optionalText(input.appId),
    pushToken
  });

  return { ok: true as const };
}

export async function unregisterPublicMobilePushDevice(input: {
  siteId: string;
  sessionId: string;
  pushToken: string;
}) {
  const pushToken = optionalText(input.pushToken);
  if (!pushToken) {
    throw new Error("PUSH_TOKEN_REQUIRED");
  }

  await disableMobilePushRegistrationRow({
    siteId: input.siteId,
    sessionId: input.sessionId,
    pushToken
  });
}

export async function bindSessionMobilePushDevicesToConversation(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  await bindMobilePushRegistrationsToConversationRow(input);
}

function createMobilePushRegistrationId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `push_${globalThis.crypto.randomUUID()}`;
  }

  return `push_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
