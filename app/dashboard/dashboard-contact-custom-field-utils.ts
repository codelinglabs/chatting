import type { ContactCustomFieldDefinition, ContactCustomFieldType } from "@/lib/contact-types";

export function customFieldSupportsPrefix(type: ContactCustomFieldType) {
  return type === "text" || type === "number";
}

export function customFieldPrefixPlaceholder(type: ContactCustomFieldType) {
  return type === "number" ? "Display prefix, e.g. $" : "Display prefix, e.g. #";
}

export function formatPrefixedCustomFieldValue(
  field: Pick<ContactCustomFieldDefinition, "type" | "prefix">,
  value: string
) {
  return customFieldSupportsPrefix(field.type) && field.prefix ? `${field.prefix}${value}` : value;
}
