"use client";

import { Button } from "../components/ui/Button";

export function SettingsSaveActions({
  isDirty,
  isSaving,
  onSave,
  onDiscard
}: {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <>
      <Button type="button" size="md" variant="secondary" onClick={onDiscard} disabled={!isDirty || isSaving}>
        Discard
      </Button>
      <Button type="button" size="md" onClick={onSave} disabled={!isDirty || isSaving}>
        Save changes
      </Button>
    </>
  );
}
