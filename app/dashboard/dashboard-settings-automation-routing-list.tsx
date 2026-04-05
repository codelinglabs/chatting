"use client";

import { Fragment, type ReactNode } from "react";
import type { DashboardAutomationRuleCondition } from "@/lib/data/settings-types";
import { Button } from "../components/ui/Button";
import { classNames } from "@/lib/utils";
import { BranchIcon, PlusIcon } from "./dashboard-ui";
import { ROUTING_CONDITION_OPTIONS } from "./dashboard-settings-automation-options";
import {
  getRoutingValueListId,
  getRoutingValuePlaceholder
} from "./dashboard-settings-automation-routing-helpers";
import {
  AutomationRoutingAddRuleRow,
  AutomationRoutingHintRow,
  AutomationRoutingPanel
} from "./dashboard-settings-automation-routing-panels";
import { AutomationEmptyState, AutomationUpgradeCard } from "./dashboard-settings-automation-ui";
import {
  AutomationRoutingRuleCard,
  AutomationSelectField
} from "./dashboard-settings-automation-routing-rule-card";

export type RoutingListKey = "assignRules" | "tagRules";
export type RoutingDragState = {
  list: RoutingListKey;
  ruleId: string;
  overIndex: number | null;
} | null;

type BaseRule = {
  id: string;
  condition: DashboardAutomationRuleCondition;
  value: string;
};

export function AutomationRoutingRulesList<T extends BaseRule>({
  listKey,
  title,
  description,
  actionLabel,
  emptyTitle,
  emptyDescription,
  hintText,
  rules,
  limit,
  locked,
  addedRuleId,
  dragState,
  setDragState,
  onAdd,
  onReorder,
  onUpdateCondition,
  onUpdateValue,
  onDelete,
  onMoveUp,
  onMoveDown,
  getValueError,
  getActionError,
  renderActionControl
}: {
  listKey: RoutingListKey;
  title: string;
  description: string;
  actionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  hintText: string;
  rules: T[];
  limit: number | null;
  locked: boolean;
  addedRuleId: string | null;
  dragState: RoutingDragState;
  setDragState: (value: RoutingDragState) => void;
  onAdd: () => void;
  onReorder: (list: RoutingListKey, ruleId: string, targetIndex: number) => void;
  onUpdateCondition: (ruleId: string, condition: DashboardAutomationRuleCondition) => void;
  onUpdateValue: (ruleId: string, value: string) => void;
  onDelete: (ruleId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  getValueError: (rule: T) => string | null;
  getActionError?: (rule: T) => string | null;
  renderActionControl: (rule: T) => ReactNode;
}) {
  return (
    <AutomationRoutingPanel
      title={title}
      description={description}
      action={<HeaderAddRuleButton onClick={onAdd} disabled={locked || (limit !== null && rules.length >= limit)} />}
    >
      {rules.length ? (
        <>
          <RoutingDropZone list={listKey} index={0} dragState={dragState} setDragState={setDragState} onReorder={onReorder} />
          {rules.map((rule, index) => (
            <Fragment key={rule.id}>
              <AutomationRoutingRuleCard
                conditionControl={
                  <AutomationSelectField
                    value={rule.condition}
                    autoFocus={addedRuleId === rule.id}
                    onChange={(value) => onUpdateCondition(rule.id, value as DashboardAutomationRuleCondition)}
                  >
                    {ROUTING_CONDITION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </AutomationSelectField>
                }
                actionLabel={actionLabel}
                value={rule.value}
                valueListId={getRoutingValueListId(rule.condition)}
                valuePlaceholder={getRoutingValuePlaceholder(rule.condition)}
                actionControl={renderActionControl(rule)}
                valueError={getValueError(rule)}
                actionError={getActionError?.(rule)}
                onValueChange={(value) => onUpdateValue(rule.id, value)}
                onDelete={() => onDelete(rule.id)}
                onMoveUp={() => onMoveUp(index)}
                onMoveDown={() => onMoveDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < rules.length - 1}
                isDragging={dragState?.list === listKey && dragState.ruleId === rule.id}
                onDragStart={() => setDragState({ list: listKey, ruleId: rule.id, overIndex: index })}
                onDragEnd={() => setDragState(null)}
              />
              <RoutingDropZone list={listKey} index={index + 1} dragState={dragState} setDragState={setDragState} onReorder={onReorder} />
            </Fragment>
          ))}
          <AutomationRoutingAddRuleRow onClick={onAdd} disabled={locked || (limit !== null && rules.length >= limit)} />
          <AutomationRoutingHintRow text={hintText} />
          {limit !== null ? <p className="text-[13px] text-slate-400">{rules.length} of {limit} rules used</p> : null}
          {limit !== null && !locked && rules.length >= limit ? <AutomationUpgradeCard title={`You've used all ${limit} ${title.toLowerCase()}`} description="Upgrade to Growth for unlimited rules." actionLabel="Upgrade now →" /> : null}
        </>
      ) : (
        <AutomationEmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={<BranchIcon className="h-5 w-5" />}
          action={<Button type="button" size="md" onClick={onAdd} disabled={locked}>Add your first rule</Button>}
        />
      )}
    </AutomationRoutingPanel>
  );
}

function HeaderAddRuleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button type="button" size="md" variant="secondary" onClick={onClick} disabled={disabled} leadingIcon={<PlusIcon className="h-4 w-4" />} className="h-auto rounded-none border-0 bg-transparent px-0 text-sm font-medium text-blue-600 hover:bg-transparent hover:text-blue-700">
      Add rule
    </Button>
  );
}

function RoutingDropZone({
  list,
  index,
  dragState,
  setDragState,
  onReorder
}: {
  list: RoutingListKey;
  index: number;
  dragState: RoutingDragState;
  setDragState: (value: RoutingDragState) => void;
  onReorder: (list: RoutingListKey, ruleId: string, targetIndex: number) => void;
}) {
  if (dragState?.list !== list) return null;

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setDragState({ ...dragState, overIndex: index });
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (dragState.overIndex !== index) setDragState({ ...dragState, overIndex: index });
      }}
      onDrop={(event) => {
        event.preventDefault();
        onReorder(list, dragState.ruleId, index);
      }}
      className={classNames(
        "rounded-lg border-2 border-dashed transition",
        dragState.overIndex === index ? "h-12 border-blue-400 bg-blue-50" : "h-3 border-transparent"
      )}
    />
  );
}
