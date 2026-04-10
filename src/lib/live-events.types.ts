import type { ConversationStatus, Sender } from "@/lib/types";

export type DashboardTypingActor = "visitor" | "team";

export type DashboardLiveEvent =
  | {
      type: "message.created";
      conversationId: string;
      sender: Sender;
      createdAt: string;
      preview?: string | null;
      pageUrl?: string | null;
      location?: string | null;
      siteName?: string | null;
      visitorLabel?: string | null;
      isNewConversation?: boolean;
      isNewVisitor?: boolean;
      highIntent?: boolean;
    }
  | {
      type: "conversation.updated";
      conversationId: string;
      status: ConversationStatus;
      updatedAt: string;
    }
  | {
      type: "conversation.read";
      conversationId: string;
      updatedAt: string;
    }
  | {
      type: "typing.updated";
      conversationId: string;
      actor: DashboardTypingActor;
      typing: boolean;
    }
  | {
      type: "visitor.presence.updated";
      siteId: string;
      sessionId: string;
      conversationId: string | null;
      pageUrl: string | null;
      updatedAt: string;
    };

export type PublicConversationLiveEvent =
  | {
      type: "message.created";
      conversationId: string;
      sender: Sender;
      createdAt: string;
    }
  | {
      type: "typing.updated";
      conversationId: string;
      actor: "team";
      typing: boolean;
    }
  | {
      type: "conversation.updated";
      conversationId: string;
      status: ConversationStatus;
      updatedAt: string;
    };

export type LiveEventListener<T> = (event: T) => void;
