"use client";

import { useEffect, useMemo, useState } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactCustomFieldDefinition,
  ContactDetail
} from "@/lib/contact-types";
import { getContactPlanLimits } from "@/lib/plan-limits";
import { optionalText } from "@/lib/utils";
import { Button } from "../components/ui/Button";
import { createContactCustomFieldDefinition } from "./dashboard-contact-custom-fields-editor";
import { DashboardContactCustomFieldsModal } from "./dashboard-contact-custom-fields-modal";
import { ContactCustomFieldValues } from "./dashboard-contact-custom-field-values";
import { resolveCustomFields } from "./dashboard-contact-drawer-utils";
import { ContactProfileSection } from "./dashboard-contact-profile-ui";

export function ContactCustomFieldsSection({
  detail,
  planKey,
  customFields,
  customFieldDraft,
  saving,
  onSavePatch,
  onSaveSettingsPatch,
  onCustomFieldChange
}: {
  detail: ContactDetail;
  planKey: BillingPlanKey;
  customFields: ContactCustomFieldDefinition[];
  customFieldDraft: Record<string, string>;
  saving: boolean;
  onSavePatch: (
    payload: Record<string, unknown>,
    options?: {
      optimisticDetail?: ContactDetail | null;
      previousDetail?: ContactDetail | null;
    }
  ) => Promise<void>;
  onSaveSettingsPatch: (payload: Record<string, unknown>) => Promise<boolean>;
  onCustomFieldChange: (fieldKey: string, value: string) => void;
}) {
  const limits = getContactPlanLimits(planKey);
  const [editingCustomFields, setEditingCustomFields] = useState(false);
  const [showFieldSettingsModal, setShowFieldSettingsModal] = useState(false);
  const [fieldSettingsDraft, setFieldSettingsDraft] = useState(customFields);
  const mergedCustomFields = useMemo(
    () => resolveCustomFields(customFields, detail.customFields),
    [customFields, detail.customFields]
  );
  const atFieldLimit =
    limits.customFieldsLimit !== null &&
    fieldSettingsDraft.length >= limits.customFieldsLimit;
  const fieldSettingsDirty =
    JSON.stringify(fieldSettingsDraft) !== JSON.stringify(customFields);

  useEffect(() => {
    setFieldSettingsDraft(customFields);
  }, [customFields]);

  async function saveCustomFields() {
    setEditingCustomFields(false);
    await onSavePatch(
      { customFields: customFieldDraft },
      {
        optimisticDetail: {
          ...detail,
          customFields: Object.fromEntries(
            Object.entries(customFieldDraft).filter(([, value]) => optionalText(value))
          )
        },
        previousDetail: detail
      }
    );
  }

  async function saveFieldSettings() {
    setShowFieldSettingsModal(false);
    await onSaveSettingsPatch({ customFields: fieldSettingsDraft });
  }

  function openFieldSettings(addField = false) {
    setEditingCustomFields(false);
    setFieldSettingsDraft(
      addField ? [...customFields, createContactCustomFieldDefinition()] : customFields
    );
    setShowFieldSettingsModal(true);
  }

  function closeFieldSettings() {
    setFieldSettingsDraft(customFields);
    setShowFieldSettingsModal(false);
  }

  return (
    <>
      <ContactProfileSection
        title="Custom fields"
        action={
          mergedCustomFields.length ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="h-8 rounded-xl px-3 text-xs"
                onClick={() => openFieldSettings()}
              >
                Manage
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="h-8 rounded-xl px-3 text-xs"
                onClick={() => setEditingCustomFields((current) => !current)}
              >
                {editingCustomFields ? "Cancel" : "Edit"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="h-8 rounded-xl px-3 text-xs"
              disabled={atFieldLimit}
              onClick={() => openFieldSettings(true)}
            >
              Add field
            </Button>
          )
        }
      >
        {mergedCustomFields.length ? (
          <ContactCustomFieldValues
            fields={mergedCustomFields}
            values={detail.customFields}
            draftValues={customFieldDraft}
            editing={editingCustomFields}
            saving={saving}
            onChange={onCustomFieldChange}
            onToggleEditing={() => setEditingCustomFields((current) => !current)}
            onSave={saveCustomFields}
          />
        ) : (
          <p className="text-sm text-slate-500">
            No custom fields configured yet. Add them here and they&apos;ll show
            up on every contact profile.
          </p>
        )}
      </ContactProfileSection>

      {showFieldSettingsModal ? (
        <DashboardContactCustomFieldsModal
          fields={fieldSettingsDraft}
          saving={saving}
          atLimit={atFieldLimit}
          dirty={fieldSettingsDirty}
          onChange={setFieldSettingsDraft}
          onClose={closeFieldSettings}
          onSave={saveFieldSettings}
        />
      ) : null}
    </>
  );
}
