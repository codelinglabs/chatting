"use client";

import { useEffect, useState } from "react";
import type { ContactNote } from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { DashboardModal } from "./dashboard-modal";

export function DashboardContactNoteModal({
  note,
  onClose,
  onSave
}: {
  note?: ContactNote | null;
  onClose: () => void;
  onSave: (body: string, noteId?: string | null) => Promise<void>;
}) {
  const [body, setBody] = useState(note?.body ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBody(note?.body ?? "");
  }, [note]);

  return (
    <DashboardModal
      title={note ? "Edit note" : "Add note"}
      description="This note is only visible to your team."
      onClose={saving ? () => {} : onClose}
    >
      <div className="space-y-4 px-6 py-6">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.currentTarget.value.slice(0, 1000))}
          placeholder="Add context, follow-up details, or customer memory."
          rows={6}
        />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">{body.length}/1000</span>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="md"
              disabled={saving || !body.trim()}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave(body.trim(), note?.id ?? null);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving..." : note ? "Save note" : "Add note"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardModal>
  );
}

