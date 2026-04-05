"use client";

import Link from "next/link";
import type { DashboardAutomationContext, DashboardAutomationSettings } from "@/lib/data/settings-types";
import { Textarea } from "../components/ui/Textarea";
import { ClockIcon } from "./dashboard-ui";
import {
  AWAY_TRIGGER_OPTIONS,
  EXPECTED_REPLY_TIME_OPTIONS,
  replyTimePreview
} from "./dashboard-settings-automation-options";
import { AutomationOfflineLeadCaptureFields } from "./dashboard-settings-automation-offline-lead-capture";
import {
  AutomationOfficeHoursSummary,
  AutomationOfflinePanel,
  summarizeOperatingHours
} from "./dashboard-settings-automation-offline-ui";
import {
  AutomationCheckbox,
  AutomationFieldLabel,
  AutomationSectionCard,
  AutomationSelect
} from "./dashboard-settings-automation-ui";

export function SettingsAutomationOfflineSection({
  automation,
  context,
  onChange
}: {
  automation: DashboardAutomationSettings;
  context: DashboardAutomationContext | undefined;
  onChange: (updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings) => void;
}) {
  const offline = automation.offline;
  const officeRows = summarizeOperatingHours(context?.operatingHours ?? null);
  const updateOffline = (updater: (current: DashboardAutomationSettings["offline"]) => DashboardAutomationSettings["offline"]) =>
    onChange((current) => ({ ...current, offline: updater(current.offline) }));
  const updateLeadCapture = (
    updater: (
      current: DashboardAutomationSettings["offline"]["leadCapture"]
    ) => DashboardAutomationSettings["offline"]["leadCapture"]
  ) =>
    updateOffline((current) => ({
      ...current,
      leadCapture: updater(current.leadCapture)
    }));

  return (
    <AutomationSectionCard
      title="When you're offline"
      description="Capture leads and set expectations when your team is away"
      icon={ClockIcon}
    >
      <AutomationOfflinePanel title="Auto-reply when away" description="Send an instant reply when no team members are online.">
        <AutomationCheckbox
          checked={offline.autoReplyEnabled}
          label="Auto-reply when away"
          description="Send an instant reply when no team members are online."
          onChange={(checked) =>
            updateOffline((current) => ({ ...current, autoReplyEnabled: checked }))
          }
        />
        <div>
          <AutomationFieldLabel label="Message" />
          <Textarea
            rows={3}
            maxLength={500}
            value={offline.autoReplyMessage}
            placeholder="Enter your away message..."
            onChange={(event) => {
              const value = event.currentTarget.value;
              updateOffline((current) => ({ ...current, autoReplyMessage: value }));
            }}
          />
          <p className="mt-2 text-right text-xs text-slate-400">{offline.autoReplyMessage.length} / 500</p>
        </div>
        <div>
          <AutomationFieldLabel label="When to send" />
          <AutomationSelect
            value={offline.autoReplyWhen}
            onChange={(value) =>
              updateOffline((current) => ({
                ...current,
                autoReplyWhen: value as typeof current.autoReplyWhen
              }))
            }
          >
            {AWAY_TRIGGER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </AutomationSelect>
        </div>
      </AutomationOfflinePanel>

      <AutomationOfflinePanel title="Office hours" description="Set when your team is available to chat.">
        <AutomationOfficeHoursSummary
          officeHoursEnabled={context?.officeHoursEnabled ?? false}
          officeHoursTimezone={context?.officeHoursTimezone ?? null}
          officeRows={officeRows}
        />
        <Link href="/dashboard/widget?tab=behavior&focus=operating-hours" className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
          Edit office hours →
        </Link>
      </AutomationOfflinePanel>

      <AutomationOfflinePanel title="Expected reply time" description="Show visitors how quickly you typically respond.">
        <div>
          <AutomationFieldLabel label="When online" />
          <AutomationSelect
            value={offline.expectedReplyTimeOnline}
            onChange={(value) =>
              updateOffline((current) => ({
                ...current,
                expectedReplyTimeOnline: value as typeof current.expectedReplyTimeOnline
              }))
            }
          >
            {EXPECTED_REPLY_TIME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </AutomationSelect>
        </div>
        <div>
          <AutomationFieldLabel label="When offline" />
          <AutomationSelect
            value={offline.expectedReplyTimeOffline}
            onChange={(value) =>
              updateOffline((current) => ({
                ...current,
                expectedReplyTimeOffline: value as typeof current.expectedReplyTimeOffline
              }))
            }
          >
            {EXPECTED_REPLY_TIME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </AutomationSelect>
        </div>
        <p className="text-sm text-slate-500">Preview: "{replyTimePreview(offline.expectedReplyTimeOnline)}"</p>
      </AutomationOfflinePanel>

      <AutomationOfflinePanel title="Lead capture when missed" description="Collect contact info when your team can't respond in time.">
        <AutomationOfflineLeadCaptureFields leadCapture={offline.leadCapture} onChange={updateLeadCapture} />
      </AutomationOfflinePanel>
    </AutomationSectionCard>
  );
}
