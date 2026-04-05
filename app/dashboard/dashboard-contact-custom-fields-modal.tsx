"use client";

import type { ContactCustomFieldDefinition } from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import { DashboardModal } from "./dashboard-modal";
import {
  ContactCustomFieldsEditor,
  createContactCustomFieldDefinition
} from "./dashboard-contact-custom-fields-editor";

export function DashboardContactCustomFieldsModal({
  fields,
  saving,
  atLimit,
  dirty,
  onChange,
  onClose,
  onSave
}: {
  fields: ContactCustomFieldDefinition[];
  saving: boolean;
  atLimit: boolean;
  dirty: boolean;
  onChange: (fields: ContactCustomFieldDefinition[]) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
}) {
  return (
    <DashboardModal
      title="Manage custom fields"
      description="This changes the field setup for every contact. Edit each contact's actual value in their profile."
      widthClass="max-w-[720px]"
      onClose={saving ? () => {} : onClose}
      actions={
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={atLimit}
          onClick={() =>
            onChange([...fields, createContactCustomFieldDefinition()])
          }
        >
          Add field
        </Button>
      }
    >
      <div className="space-y-5 px-6 py-6">
        <ContactCustomFieldsEditor
          fields={fields}
          onChange={onChange}
          emptyMessage="No custom fields yet. Add the fields you want to show on contact profiles."
        />

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            disabled={saving || !dirty}
            onClick={() => void onSave()}
          >
            Save fields
          </Button>
        </div>
      </div>
    </DashboardModal>
  );
}
