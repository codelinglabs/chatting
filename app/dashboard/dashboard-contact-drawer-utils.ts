import type {
  ContactCustomFieldDefinition,
  ContactCustomFieldType,
  ContactLocation,
  ContactSource
} from "@/lib/contact-types";
import { formatPrefixedCustomFieldValue } from "./dashboard-contact-custom-field-utils";

type ResolvedCustomField = Pick<
  ContactCustomFieldDefinition,
  "id" | "key" | "label" | "type" | "options" | "prefix"
>;

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export function contactLocationLabel(location: ContactLocation) {
  return [location.city, location.region, location.country].filter(Boolean).join(", ");
}

export function contactSummaryLine(company: string | null, location: ContactLocation) {
  return [company, contactLocationLabel(location)].filter(Boolean).join(" · ");
}

export function contactSourceSummary(source: ContactSource) {
  const channel = source.utmMedium ?? source.utmSource;
  return [source.referrer, channel].filter(Boolean).join(" / ");
}

export function formatAvgSessionLabel(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }

  const totalSeconds = Math.round(seconds);
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;

  if (totalSeconds < minute) {
    return `${totalSeconds}s`;
  }

  if (totalSeconds < hour) {
    const minutes = Math.floor(totalSeconds / minute);
    const remainingSeconds = totalSeconds % minute;
    return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  if (totalSeconds < day) {
    const hours = Math.floor(totalSeconds / hour);
    const remainingMinutes = Math.floor((totalSeconds % hour) / minute);
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  if (totalSeconds < month) {
    const days = Math.floor(totalSeconds / day);
    const remainingHours = Math.floor((totalSeconds % day) / hour);
    return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  const months = Math.floor(totalSeconds / month);
  const remainingDays = Math.floor((totalSeconds % month) / day);
  return remainingDays ? `${months}mo ${remainingDays}d` : `${months}mo`;
}

export function humanizeContactFieldKey(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function resolveCustomFields(
  definitions: ContactCustomFieldDefinition[],
  values: Record<string, string>
) {
  const definitionMap = new Map(definitions.map((field) => [field.key, field]));
  return Array.from(new Set([...definitions.map((field) => field.key), ...Object.keys(values)])).map((key) => {
    const definition = definitionMap.get(key);
    return {
      id: definition?.id ?? key,
      key,
      label: definition?.label ?? humanizeContactFieldKey(key),
      type: definition?.type ?? ("text" satisfies ContactCustomFieldType),
      options: definition?.options ?? [],
      prefix: definition?.prefix ?? null
    } satisfies ResolvedCustomField;
  });
}

export function formatCustomFieldValue(
  field: Pick<ContactCustomFieldDefinition, "type" | "prefix">,
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  if (field.type === "date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
  }

  return formatPrefixedCustomFieldValue(field, value);
}

export function contactConversationStatusLabel(status: "open" | "resolved") {
  return status === "open" ? "Open" : "Resolved";
}
