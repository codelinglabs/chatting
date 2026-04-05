"use client";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { DashboardModal } from "./dashboard-modal";

export type FaqDraft = {
  question: string;
  keywords: string;
  answer: string;
  link: string;
};

export function DashboardFaqEntryModal({
  title,
  draft,
  saving,
  onChange,
  onClose,
  onSave
}: {
  title: string;
  draft: FaqDraft;
  saving: boolean;
  onChange: (next: FaqDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const answerCount = draft.answer.length;
  const canSave = Boolean(
    draft.question.trim() &&
    draft.keywords.trim() &&
    draft.answer.trim()
  );

  return (
    <DashboardModal title={title} description="Add questions and answers visitors can see before they connect to your team." onClose={saving ? () => {} : onClose}>
      <div className="space-y-5 px-6 py-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Question</label>
          <Input value={draft.question} maxLength={120} placeholder="What question does this answer?" onChange={(event) => onChange({ ...draft, question: event.currentTarget.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Keywords</label>
          <Input value={draft.keywords} maxLength={160} placeholder="password, reset, forgot" onChange={(event) => onChange({ ...draft, keywords: event.currentTarget.value })} />
          <p className="mt-2 text-xs text-slate-500">Comma-separated words that trigger this FAQ.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Answer</label>
          <Textarea value={draft.answer} rows={5} maxLength={500} placeholder="Enter the answer..." onChange={(event) => onChange({ ...draft, answer: event.currentTarget.value })} />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <p>The answer shown to visitors.</p>
            <p>{answerCount}/500</p>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Link (optional)</label>
          <Input value={draft.link} maxLength={200} placeholder="https://help.yoursite.com/password-reset" onChange={(event) => onChange({ ...draft, link: event.currentTarget.value })} />
          <p className="mt-2 text-xs text-slate-500">"Read more" link shown after the answer.</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
        <Button type="button" size="md" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="button" size="md" onClick={onSave} disabled={saving || !canSave}>Save FAQ entry</Button>
      </div>
    </DashboardModal>
  );
}
