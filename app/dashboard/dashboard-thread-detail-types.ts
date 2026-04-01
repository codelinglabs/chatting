import type { FormEvent } from "react";
import type { ConversationStatus, ConversationSummary, ConversationThread } from "@/lib/types";

export type DashboardThreadDetailProps = {
  activeConversation: ConversationThread | null;
  loadingConversationSummary: ConversationSummary | null;
  savingEmail: boolean;
  sendingReply: boolean;
  updatingStatus: boolean;
  isVisitorTyping: boolean;
  isLiveDisconnected: boolean;
  teamName: string;
  teamInitials: string;
  showSidebarInline?: boolean;
  showSidebarDrawer?: boolean;
  showBackButton?: boolean;
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSendReply: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onRetryReply: (messageId: string) => Promise<void>;
  onConversationStatusChange: (status: ConversationStatus) => Promise<void>;
  onReplyComposerBlur: () => void;
  onReplyComposerFocus: (value: string) => void;
  onReplyComposerInput: (value: string) => void;
  onToggleTag: (tag: string) => Promise<void>;
  onBack?: () => void;
  onOpenSidebar?: () => void;
  onCloseSidebar?: () => void;
};
