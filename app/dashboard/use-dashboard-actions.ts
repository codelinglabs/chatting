"use client";

import { createDashboardMutationActions } from "./use-dashboard-actions.mutations";
import { createDashboardReplyActions } from "./use-dashboard-actions.reply";
import { createDashboardTypingActions } from "./use-dashboard-actions.typing";
import type { DashboardActionsParams } from "./use-dashboard-actions.types";

export function createDashboardActions(params: DashboardActionsParams) {
  return {
    ...createDashboardMutationActions(params),
    ...createDashboardReplyActions(params),
    ...createDashboardTypingActions(params)
  };
}
