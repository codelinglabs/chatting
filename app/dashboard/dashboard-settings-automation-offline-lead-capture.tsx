"use client";

import type { DashboardAutomationSettings } from "@/lib/data/settings-types";
import { Textarea } from "../components/ui/Textarea";
import { RESPONSE_MINUTE_OPTIONS } from "./dashboard-settings-automation-options";
import {
  AutomationCheckbox,
  AutomationFieldLabel,
  AutomationSelect
} from "./dashboard-settings-automation-ui";

export function AutomationOfflineLeadCaptureFields({
  leadCapture,
  onChange
}: {
  leadCapture: DashboardAutomationSettings["offline"]["leadCapture"];
  onChange: (
    updater: (
      current: DashboardAutomationSettings["offline"]["leadCapture"]
    ) => DashboardAutomationSettings["offline"]["leadCapture"]
  ) => void;
}) {
  return (
    <>
      <AutomationCheckbox
        checked={leadCapture.requireEmailWhenOffline}
        label="Require email when team is offline"
        onChange={(checked) =>
          onChange((current) => ({ ...current, requireEmailWhenOffline: checked }))
        }
      />
      <AutomationCheckbox
        checked={leadCapture.requireEmailAfterNoResponse}
        label="Require email after no response"
        description={
          leadCapture.requireEmailAfterNoResponse
            ? undefined
            : "Show email capture after a response timeout."
        }
        onChange={(checked) =>
          onChange((current) => ({ ...current, requireEmailAfterNoResponse: checked }))
        }
      />
      {leadCapture.requireEmailAfterNoResponse ? (
        <div>
          <AutomationFieldLabel label="After" />
          <AutomationSelect
            value={leadCapture.requireEmailAfterMinutes}
            onChange={(value) =>
              onChange((current) => ({
                ...current,
                requireEmailAfterMinutes: Number(value) as typeof current.requireEmailAfterMinutes
              }))
            }
          >
            {RESPONSE_MINUTE_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} {minutes === 1 ? "minute" : "minutes"}
              </option>
            ))}
          </AutomationSelect>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <AutomationCheckbox
          checked={leadCapture.collectName}
          label="Name"
          onChange={(checked) => onChange((current) => ({ ...current, collectName: checked }))}
        />
        <AutomationCheckbox
          checked={leadCapture.collectPhone}
          label="Phone number"
          onChange={(checked) => onChange((current) => ({ ...current, collectPhone: checked }))}
        />
        <AutomationCheckbox
          checked={leadCapture.collectCompany}
          label="Company"
          onChange={(checked) => onChange((current) => ({ ...current, collectCompany: checked }))}
        />
      </div>
      <div>
        <AutomationFieldLabel label="Form message" />
        <Textarea
          rows={3}
          maxLength={200}
          value={leadCapture.formMessage}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange((current) => ({ ...current, formMessage: value }));
          }}
        />
      </div>
    </>
  );
}
