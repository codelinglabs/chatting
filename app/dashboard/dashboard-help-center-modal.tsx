"use client";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { DashboardModal } from "./dashboard-modal";

export function DashboardHelpCenterModal({
  values,
  saving,
  onChange,
  onClose,
  onSave,
  title
}: {
  values: { title: string; slug: string; body: string };
  saving: boolean;
  onChange: (next: { title: string; slug: string; body: string }) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  title: string;
}) {
  return (
    <DashboardModal title={title} description="Publish quick self-serve answers your team can link from chat." onClose={saving ? () => {} : onClose}>
      <div className="space-y-4 px-6 py-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Article title</label>
          <Input value={values.title} maxLength={120} placeholder="How billing works" onChange={(event) => onChange({ ...values, title: event.currentTarget.value })} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
          <Input value={values.slug} maxLength={80} placeholder="billing" onChange={(event) => onChange({ ...values, slug: event.currentTarget.value })} />
          <p className="mt-2 text-xs text-slate-500">We'll use this in the public help-center URL.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Article body</label>
          <Textarea value={values.body} rows={12} maxLength={12000} placeholder="Add the answer your team wants to share." onChange={(event) => onChange({ ...values, body: event.currentTarget.value })} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <Button type="button" size="md" variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" size="md" onClick={() => void onSave()} disabled={saving}>
          Save article
        </Button>
      </div>
    </DashboardModal>
  );
}
