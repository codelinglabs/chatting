import type {
  DashboardAutomationAssignRule,
  DashboardAutomationRuleCondition,
  DashboardAutomationTagRule
} from "@/lib/data/settings-types";

const ROUTING_GUIDE_TAG_SUGGESTIONS = [
  "sales-lead",
  "sales-opportunity",
  "demo-request",
  "signup-help",
  "purchase-intent",
  "product-widget",
  "product-dashboard",
  "integrations",
  "bug-report",
  "feature-request",
  "how-to",
  "troubleshooting",
  "high-priority",
  "critical",
  "negative-sentiment",
  "escalation-risk",
  "positive-feedback",
  "testimonial-candidate",
  "source-google",
  "source-facebook",
  "source-twitter",
  "source-linkedin",
  "source-producthunt",
  "campaign-launch",
  "campaign-blackfriday",
  "region-us",
  "region-eu"
] as const;

const ROUTING_GUIDE_VISITOR_TAG_SUGGESTIONS = [
  "vip",
  "enterprise",
  "trial",
  "client"
] as const;

const ROUTING_VALUE_PLACEHOLDERS: Record<DashboardAutomationRuleCondition, string> = {
  page_url_contains: "/pricing, /checkout",
  page_url_exact: "/contact",
  page_url_starts_with: "/docs/",
  first_message_contains: "refund, cancel, billing",
  referrer_contains: "google.com",
  visitor_location: "United States",
  visitor_tag: "enterprise",
  custom_field_equals: "plan = Pro"
};

export function getRoutingValuePlaceholder(condition: DashboardAutomationRuleCondition) {
  return ROUTING_VALUE_PLACEHOLDERS[condition];
}

export function getRoutingValueListId(condition: DashboardAutomationRuleCondition) {
  return condition === "visitor_tag" ? "automation-routing-value-tags" : undefined;
}

function mergeUniqueOptions(primary: readonly string[], secondary: readonly string[]) {
  return Array.from(new Set([...primary, ...secondary].map((value) => value.trim()).filter(Boolean)));
}

export function getRoutingTagActionOptions(tagOptions: string[]) {
  return mergeUniqueOptions(tagOptions, ROUTING_GUIDE_TAG_SUGGESTIONS);
}

export function getRoutingVisitorTagOptions(tagOptions: string[]) {
  return mergeUniqueOptions(tagOptions, ROUTING_GUIDE_VISITOR_TAG_SUGGESTIONS);
}

export function getAssignRuleErrors(rule: DashboardAutomationAssignRule) {
  return {
    value: rule.value.trim() ? null : "Enter a value.",
    action: null
  };
}

export function getTagRuleErrors(rule: DashboardAutomationTagRule) {
  return {
    value: rule.value.trim() ? null : "Enter a value.",
    action: rule.tag.trim() ? null : "Select or create a tag."
  };
}

export function reorderRoutingItems<T extends { id: string }>(
  items: T[],
  draggedId: string,
  targetIndex: number
) {
  const fromIndex = items.findIndex((item) => item.id === draggedId);
  if (fromIndex < 0) return items;

  const next = [...items];
  const [movedItem] = next.splice(fromIndex, 1);
  if (!movedItem) return items;

  const safeTargetIndex = Math.max(0, Math.min(targetIndex, items.length));
  const insertionIndex = fromIndex < safeTargetIndex ? safeTargetIndex - 1 : safeTargetIndex;

  next.splice(insertionIndex, 0, movedItem);
  return next;
}

export function moveRoutingItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export function updateRoutingItemById<T extends { id: string }>(
  items: T[],
  ruleId: string,
  updater: (rule: T) => T
) {
  return items.map((rule) => (rule.id === ruleId ? updater(rule) : rule));
}
