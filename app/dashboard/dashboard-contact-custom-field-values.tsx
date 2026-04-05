"use client";

import type { ContactCustomFieldDefinition } from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  formatCustomFieldValue
} from "./dashboard-contact-drawer-utils";
import {
  CONTACT_SELECT_CLASS_NAME,
  ContactProfileRow
} from "./dashboard-contact-profile-ui";

export function ContactCustomFieldValues({
  fields,
  values,
  draftValues,
  editing,
  saving,
  onChange,
  onToggleEditing,
  onSave
}: {
  fields: Pick<
    ContactCustomFieldDefinition,
    "key" | "label" | "type" | "options" | "prefix"
  >[];
  values: Record<string, string>;
  draftValues: Record<string, string>;
  editing: boolean;
  saving: boolean;
  onChange: (fieldKey: string, value: string) => void;
  onToggleEditing: () => void;
  onSave: () => Promise<void>;
}) {
  if (editing) {
    return (
      <div className="space-y-3">
        {fields.map((field) => (
          <label key={field.key} className="space-y-2 text-sm text-slate-700">
            <span className="block font-medium">{field.label}</span>
            {field.type === "dropdown" ? (
              <select
                value={draftValues[field.key] ?? ""}
                onChange={(event) => onChange(field.key, event.currentTarget.value)}
                className={CONTACT_SELECT_CLASS_NAME}
              >
                <option value="">Select...</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "date"
                      ? "date"
                      : field.type === "url"
                        ? "url"
                        : "text"
                }
                value={draftValues[field.key] ?? ""}
                onChange={(event) => onChange(field.key, event.currentTarget.value)}
              />
            )}
          </label>
        ))}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="md" onClick={onToggleEditing}>
            Cancel
          </Button>
          <Button type="button" size="md" disabled={saving} onClick={() => void onSave()}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {fields.map((field) => {
        const rawValue = values[field.key];
        const displayValue =
          field.type === "url" && rawValue ? (
            <a
              href={rawValue}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              {rawValue}
            </a>
          ) : (
            formatCustomFieldValue(field, rawValue)
          );

        return (
          <ContactProfileRow
            key={field.key}
            label={field.label}
            value={displayValue}
          />
        );
      })}
    </div>
  );
}
