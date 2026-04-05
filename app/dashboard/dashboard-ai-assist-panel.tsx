"use client";

import { useEffect, useState } from "react";
import type { DashboardAiAssistAction, DashboardAiAssistResult } from "@/lib/dashboard-ai-assist";
import type { ConversationThread } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";
import { DashboardAiAssistResultCard } from "./dashboard-ai-assist-result";

const ACTIONS: Array<{ id: DashboardAiAssistAction; label: string }> = [
  { id: "summarize", label: "Summarize" },
  { id: "rewrite", label: "Rewrite draft" },
  { id: "reply", label: "Suggest reply" },
  { id: "tags", label: "Suggest tags" }
];

function messageForCode(code: string) {
  switch (code) {
    case "draft-required":
      return "Write a draft first so AI has something to rewrite.";
    case "ai-provider-not-configured":
      return "AI assist isn't configured yet.";
    default:
      return "AI assist couldn't finish that request.";
  }
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4">
      <div className="h-3 w-28 rounded bg-blue-100" />
      <div className="mt-4 h-3 w-full rounded bg-white" />
      <div className="mt-2 h-3 w-5/6 rounded bg-white" />
      <div className="mt-2 h-3 w-2/3 rounded bg-white" />
    </div>
  );
}

export function DashboardAiAssistPanel({
  activeConversation,
  readDraft,
  onApplyDraft,
  onApplyTag
}: {
  activeConversation: ConversationThread;
  readDraft: () => string;
  onApplyDraft: (value: string) => void;
  onApplyTag: (tag: string) => Promise<void>;
}) {
  const { showToast } = useToast();
  const [pendingAction, setPendingAction] = useState<DashboardAiAssistAction | null>(null);
  const [applyingTag, setApplyingTag] = useState<string | null>(null);
  const [result, setResult] = useState<DashboardAiAssistResult | null>(null);

  useEffect(() => {
    setPendingAction(null);
    setApplyingTag(null);
    setResult(null);
  }, [activeConversation.id]);

  async function runAction(action: DashboardAiAssistAction) {
    if (pendingAction) {
      return;
    }

    setPendingAction(action);
    setResult(null);
    try {
      const response = await fetch("/dashboard/ai-assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          conversationId: activeConversation.id,
          draft: readDraft()
        })
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        result?: DashboardAiAssistResult;
      };

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(messageForCode(String(payload.error ?? "ai-assist-failed")));
      }

      setResult(payload.result);
    } catch (error) {
      showToast(
        "error",
        "We couldn't generate that AI assist result.",
        error instanceof Error ? error.message : "Please try again in a moment."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function applyTag(tag: string) {
    if (applyingTag) {
      return;
    }

    setApplyingTag(tag);
    try {
      await onApplyTag(tag);
    } finally {
      setApplyingTag(null);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {ACTIONS.map((action) => (
          <Button
            key={action.id}
            type="button"
            size="md"
            variant="secondary"
            className="h-8 rounded-full px-3 text-xs"
            disabled={Boolean(pendingAction)}
            onClick={() => void runAction(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {pendingAction ? <LoadingCard /> : null}
      {result ? (
        <DashboardAiAssistResultCard
          result={result}
          currentTags={activeConversation.tags}
          applyingTag={applyingTag}
          onApplyDraft={onApplyDraft}
          onApplyTag={(tag) => void applyTag(tag)}
        />
      ) : null}
    </div>
  );
}
