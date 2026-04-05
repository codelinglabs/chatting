"use client";

import type {
  ContactCustomFieldDefinition,
  ContactCustomFieldType
} from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  customFieldPrefixPlaceholder,
  customFieldSupportsPrefix
} from "./dashboard-contact-custom-field-utils";

const CUSTOM_FIELD_TYPES: ContactCustomFieldType[] = [
  "text",
  "dropdown",
  "date",
  "number",
  "url"
];

const SELECT_CLASS_NAME =
  "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function slugifyFieldKey(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") || `field-${Date.now()}`
  );
}

function updateField(
  fields: ContactCustomFieldDefinition[],
  index: number,
  updater: (field: ContactCustomFieldDefinition) => ContactCustomFieldDefinition
) {
  return fields.map((entry, entryIndex) =>
    entryIndex === index ? updater(entry) : entry
  );
}

function FieldLabel({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
        {title}
      </span>
      {children}
    </label>
  );
}

export function createContactCustomFieldDefinition(): ContactCustomFieldDefinition {
  const id =
    globalThis.crypto?.randomUUID?.() ?? `field-${Date.now()}-${Math.random()}`;
  return {
    id,
    key: id,
    label: "New field",
    type: "text",
    options: [],
    prefix: null
  };
}

export function ContactCustomFieldsEditor({
  fields,
  onChange,
  emptyMessage = "No custom fields yet. Add the fields you want to show on contact profiles."
}: {
  fields: ContactCustomFieldDefinition[];
  onChange: (fields: ContactCustomFieldDefinition[]) => void;
  emptyMessage?: string;
}) {
  return (
    <div className="space-y-3">
      {!fields.length && emptyMessage ? (
        <p className="rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : null}

      {fields.map((field, index) => {
        const showPrefix = customFieldSupportsPrefix(field.type);
        const gridClass = showPrefix
          ? "md:grid-cols-[minmax(0,1fr)_160px_160px_auto]"
          : "md:grid-cols-[minmax(0,1fr)_160px_auto]";
        const setField = (
          updater: (entry: ContactCustomFieldDefinition) => ContactCustomFieldDefinition
        ) => onChange(updateField(fields, index, updater));

        return (
          <div key={field.id} className="space-y-3 rounded-lg bg-slate-50 p-4">
            <div className={`grid gap-3 ${gridClass}`}>
              <FieldLabel title="Field name">
                <Input
                  value={field.label}
                  onChange={(event) =>
                    setField((entry) => ({
                      ...entry,
                      label: event.currentTarget.value,
                      key: slugifyFieldKey(event.currentTarget.value) || entry.key
                    }))
                  }
                  placeholder="Plan"
                />
              </FieldLabel>

              <FieldLabel title="Type">
                <select
                  value={field.type}
                  onChange={(event) =>
                    setField((entry) => ({
                      ...entry,
                      type: event.currentTarget.value as ContactCustomFieldType,
                      prefix: customFieldSupportsPrefix(
                        event.currentTarget.value as ContactCustomFieldType
                      )
                        ? entry.prefix
                        : null
                    }))
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {CUSTOM_FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FieldLabel>

              {showPrefix ? (
                <FieldLabel title="Prefix">
                  <Input
                    value={field.prefix ?? ""}
                    onChange={(event) =>
                      setField((entry) => ({
                        ...entry,
                        prefix: event.currentTarget.value || null
                      }))
                    }
                    placeholder={customFieldPrefixPlaceholder(field.type)}
                  />
                </FieldLabel>
              ) : null}

              <Button
                type="button"
                variant="secondary"
                size="md"
                className="self-end"
                onClick={() =>
                  onChange(fields.filter((_, entryIndex) => entryIndex !== index))
                }
              >
                Delete
              </Button>
            </div>

            {field.type === "dropdown" ? (
              <FieldLabel title="Options">
                <Input
                  value={field.options.join(", ")}
                  onChange={(event) =>
                    setField((entry) => ({
                      ...entry,
                      options: event.currentTarget.value
                        .split(",")
                        .map((option) => option.trim())
                        .filter(Boolean)
                    }))
                  }
                  placeholder="Free, Pro, Business"
                />
              </FieldLabel>
            ) : null}

            {showPrefix ? (
              <p className="text-xs text-slate-500">
                Optional. Shown before every contact value, like "$49" or "#1234".
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
