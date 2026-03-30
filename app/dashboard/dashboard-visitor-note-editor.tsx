"use client";

import { useEffect, useMemo, useState } from "react";
import { FormButton, FormTextarea } from "../ui/form-controls";
import { useToast } from "../ui/toast-provider";
import { errorMessageForCode } from "./dashboard-client.utils";
import { formatRelativeTime } from "@/lib/utils";

type VisitorNoteEditorProps = {
  conversationId?: string | null;
  siteId?: string | null;
  sessionId?: string | null;
  email?: string | null;
};

type VisitorNotePayload = {
  ok: boolean;
  note?: string | null;
  updatedAt?: string | null;
  error?: string;
};

function buildIdentityParams(props: VisitorNoteEditorProps) {
  const params = new URLSearchParams();

  if (props.conversationId) {
    params.set("conversationId", props.conversationId);
    return params;
  }

  if (!props.siteId || (!props.email && !props.sessionId)) {
    return null;
  }

  params.set("siteId", props.siteId);
  if (props.email) {
    params.set("email", props.email);
  }
  if (props.sessionId) {
    params.set("sessionId", props.sessionId);
  }

  return params;
}

function NoteEditorSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-28 rounded-2xl bg-slate-100" />
      <div className="space-y-2">
        <div className="h-4 w-40 rounded bg-slate-100" />
        <div className="ml-auto h-10 w-24 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export function DashboardVisitorNoteEditor(props: VisitorNoteEditorProps) {
  const { showToast } = useToast();
  const params = useMemo(
    () => buildIdentityParams(props),
    [props.conversationId, props.email, props.sessionId, props.siteId]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!params) {
      setLoading(false);
      setDraft("");
      setSavedNote("");
      setUpdatedAt(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetch(`/dashboard/visitor-note?${params.toString()}`, {
      method: "GET",
      cache: "no-store"
    })
      .then(async (response) => {
        const payload = (await response.json()) as VisitorNotePayload;
        if (!response.ok || !payload.ok) {
          throw new Error(errorMessageForCode(payload.error ?? "unknown"));
        }

        if (cancelled) {
          return;
        }

        const note = payload.note ?? "";
        setDraft(note);
        setSavedNote(note);
        setUpdatedAt(payload.updatedAt ?? null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setDraft("");
        setSavedNote("");
        setUpdatedAt(null);
        showToast(
          "error",
          "We couldn't load visitor notes.",
          error instanceof Error ? error.message : "Please try again in a moment."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params, showToast]);

  async function handleSave() {
    if (!params || saving) {
      return;
    }

    const formData = new FormData();
    for (const [key, value] of params.entries()) {
      formData.set(key, value);
    }
    formData.set("note", draft);

    setSaving(true);

    try {
      const response = await fetch("/dashboard/visitor-note", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as VisitorNotePayload;
      if (!response.ok || !payload.ok) {
        throw new Error(errorMessageForCode(payload.error ?? "unknown"));
      }

      const nextNote = payload.note ?? "";
      setDraft(nextNote);
      setSavedNote(nextNote);
      setUpdatedAt(payload.updatedAt ?? null);
      showToast(
        "success",
        nextNote ? "Visitor note saved." : "Visitor note cleared."
      );
    } catch (error) {
      showToast(
        "error",
        "We couldn't save the visitor note.",
        error instanceof Error ? error.message : "Please try again in a moment."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <NoteEditorSkeleton />;
  }

  return (
    <div className="space-y-3">
      <FormTextarea
        rows={5}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Add context, objections, or follow-up details for this visitor."
        className="min-h-[120px] rounded-2xl"
      />
      <div className="space-y-2">
        <p className="text-xs leading-5 text-slate-400">
          {updatedAt ? `Updated ${formatRelativeTime(updatedAt)}` : "Saved and shared across this visitor's conversations."}
        </p>
        <div className="flex justify-end">
          <FormButton
            type="button"
            size="md"
            onClick={() => void handleSave()}
            disabled={saving || draft.trim() === savedNote.trim()}
            className="w-full sm:min-w-[108px] sm:w-auto"
          >
            {saving ? "Saving..." : "Save note"}
          </FormButton>
        </div>
      </div>
    </div>
  );
}
