"use client";

import type { BillingPlanKey } from "@/lib/data/billing-types";
import type {
  DashboardAutomationPagePrompt,
  DashboardAutomationPromptDelaySeconds
} from "@/lib/data/settings-types";
import {
  createAutomationId,
  promptDelayLabel
} from "./dashboard-settings-automation-options";

export const PROACTIVE_MESSAGE_EXAMPLES: Array<{
  pagePath: string;
  message: string;
  delaySeconds: DashboardAutomationPromptDelaySeconds;
}> = [
  { pagePath: "/pricing", message: "Questions about our plans? Happy to help!", delaySeconds: 30 },
  { pagePath: "/checkout*", message: "Need help completing your order?", delaySeconds: 60 },
  { pagePath: "/demo", message: "Want a personalized walkthrough? I'm here!", delaySeconds: 10 },
  { pagePath: "/enterprise", message: "Looking for enterprise features? Let's chat.", delaySeconds: 30 },
  { pagePath: "/contact", message: "Want a faster response? Chat with us now!", delaySeconds: 10 },
  { pagePath: "/products/*", message: "Need help choosing? I can recommend options.", delaySeconds: 120 }
];

export function createProactivePrompt(): DashboardAutomationPagePrompt {
  return {
    id: createAutomationId("prompt"),
    pagePath: "",
    message: "",
    delaySeconds: 30,
    autoOpenWidget: true
  };
}

export function proactivePathError(value: string) {
  if (!value.trim()) {
    return "Enter a page path.";
  }

  if (!value.trim().startsWith("/")) {
    return "Page path must start with /";
  }

  return null;
}

export function proactiveMessageError(value: string) {
  return value.trim() ? null : "Enter a message.";
}

export function proactivePromptErrors(prompt: DashboardAutomationPagePrompt) {
  return {
    pagePath: proactivePathError(prompt.pagePath),
    message: proactiveMessageError(prompt.message)
  };
}

export function isEmptyProactivePrompt(prompt: DashboardAutomationPagePrompt) {
  return !prompt.pagePath.trim() && !prompt.message.trim();
}

export function proactivePromptMeta(prompt: DashboardAutomationPagePrompt) {
  return `${promptDelayLabel(prompt.delaySeconds)} \u00b7 ${prompt.autoOpenWidget ? "Opens widget" : "Shows bubble only"}`;
}

export function proactivePromptSummary(prompt: DashboardAutomationPagePrompt) {
  const message = prompt.message.trim() || "Message not set yet";
  return `"${message}"`;
}

export function reorderProactivePrompts(
  prompts: DashboardAutomationPagePrompt[],
  promptId: string,
  targetPromptId: string
) {
  if (promptId === targetPromptId) {
    return prompts;
  }

  const sourceIndex = prompts.findIndex((prompt) => prompt.id === promptId);
  const targetIndex = prompts.findIndex((prompt) => prompt.id === targetPromptId);
  if (sourceIndex < 0 || targetIndex < 0) {
    return prompts;
  }

  const next = [...prompts];
  const [movedPrompt] = next.splice(sourceIndex, 1);
  next.splice(sourceIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, movedPrompt);
  return next;
}

export function proactiveLimitCopy(limit: number, count: number, planName: string) {
  return `${count} of ${limit} rules (${planName})`;
}

export function proactiveUpgradeTitle(limit: number) {
  return limit === 1
    ? "You've used your proactive message rule"
    : `You've used all ${limit} proactive message rules`;
}

export function proactiveUpgradeDescription(planKey: BillingPlanKey) {
  if (planKey === "growth") {
    return "";
  }

  return "Upgrade to Growth for unlimited proactive message rules.";
}
