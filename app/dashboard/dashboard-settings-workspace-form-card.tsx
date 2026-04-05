"use client";

import { Input } from "../components/ui/Input";
import { SettingsCard } from "./dashboard-settings-shared";

export function SettingsWorkspaceFormCard({
  teamName,
  onUpdateTeamName
}: {
  teamName: string;
  onUpdateTeamName: (value: string) => void;
}) {
  return (
    <SettingsCard
      title="Team identity"
      description="This name is used for your default workspace identity and visitor email replies."
    >
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Team name</span>
        <Input
          value={teamName}
          onChange={(event) => onUpdateTeamName(event.target.value)}
          placeholder="Acme Support"
        />
      </label>
    </SettingsCard>
  );
}
