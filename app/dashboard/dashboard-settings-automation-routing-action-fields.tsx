"use client";

import type {
  DashboardAutomationAssignRule,
  DashboardTeamMember
} from "@/lib/data/settings-types";
import { AutomationSelectField } from "./dashboard-settings-automation-routing-rule-card";

export function AutomationAssignActionField({
  rule,
  members,
  onChange
}: {
  rule: DashboardAutomationAssignRule;
  members: DashboardTeamMember[];
  onChange: (rule: DashboardAutomationAssignRule) => void;
}) {
  return (
    <AutomationSelectField
      value={rule.target.type === "member" ? rule.target.memberId : "round_robin"}
      onChange={(value) =>
        onChange({
          ...rule,
          target:
            value === "round_robin"
              ? { type: "round_robin" }
              : { type: "member", memberId: value }
        })
      }
      className="h-10 rounded-md"
    >
      <optgroup label="TEAM">
        <option value="round_robin">All team members (round robin)</option>
      </optgroup>
      <optgroup label="PEOPLE">
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </optgroup>
    </AutomationSelectField>
  );
}
