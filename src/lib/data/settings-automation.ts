import type {
  DashboardAutomationAssignRule,
  DashboardAutomationFaqEntry,
  DashboardAutomationPagePrompt,
  DashboardAutomationRuleCondition,
  DashboardAutomationSettings
} from "@/lib/data/settings-types";
import type { WidgetResponseTimeMode } from "@/lib/types";
import { optionalText } from "@/lib/utils";
const RULE_CONDITIONS: DashboardAutomationRuleCondition[] = [
  "page_url_contains",
  "page_url_exact",
  "page_url_starts_with",
  "visitor_location",
  "first_message_contains",
  "visitor_tag",
  "referrer_contains",
  "custom_field_equals"
];
const REPLY_TIMES: WidgetResponseTimeMode[] = ["minutes", "hours", "day", "hidden"];
const RESPONSE_MINUTES = [1, 2, 3, 5, 10] as const;
const PROMPT_DELAYS = [0, 10, 30, 60, 120, 300] as const;
function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeReplyTime(value: unknown, fallback: WidgetResponseTimeMode) {
  return REPLY_TIMES.includes(value as WidgetResponseTimeMode) ? (value as WidgetResponseTimeMode) : fallback;
}

function normalizeRuleCondition(value: unknown, fallback: DashboardAutomationRuleCondition) {
  return RULE_CONDITIONS.includes(value as DashboardAutomationRuleCondition)
    ? (value as DashboardAutomationRuleCondition)
    : fallback;
}

function normalizeId(value: unknown, prefix: string, index: number) {
  return optionalText(String(value ?? "")) || `${prefix}_${index + 1}`;
}

function normalizeFaqKeywords(value: unknown) {
  return Array.isArray(value)
    ? value.map((entry) => optionalText(String(entry))).filter((entry): entry is string => Boolean(entry)).slice(0, 8)
    : [];
}

function normalizeAssignRule(value: unknown, index: number): DashboardAutomationAssignRule {
  const entry = isObject(value) ? value : {};
  const target = isObject(entry.target) ? entry.target : {};
  const memberId = optionalText(String(target.memberId ?? ""));

  return {
    id: normalizeId(entry.id, "assign", index),
    condition: normalizeRuleCondition(entry.condition, "page_url_contains"),
    value: optionalText(String(entry.value ?? ""))?.slice(0, 120) ?? "",
    target: target.type === "member" && memberId ? { type: "member", memberId } : { type: "round_robin" }
  };
}

function normalizeTagRule(value: unknown, index: number) {
  const entry = isObject(value) ? value : {};
  return {
    id: normalizeId(entry.id, "tag", index),
    condition: normalizeRuleCondition(entry.condition, "page_url_contains"),
    value: optionalText(String(entry.value ?? ""))?.slice(0, 120) ?? "",
    tag: optionalText(String(entry.tag ?? ""))?.slice(0, 24) ?? ""
  };
}

function normalizeFaqEntry(value: unknown, index: number): DashboardAutomationFaqEntry {
  const entry = isObject(value) ? value : {};
  return {
    id: normalizeId(entry.id, "faq", index),
    question: optionalText(String(entry.question ?? ""))?.slice(0, 120) ?? "",
    keywords: normalizeFaqKeywords(entry.keywords),
    answer: optionalText(String(entry.answer ?? ""))?.slice(0, 600) ?? "",
    link: optionalText(String(entry.link ?? ""))?.slice(0, 200) ?? ""
  };
}

function normalizePrompt(value: unknown, index: number): DashboardAutomationPagePrompt {
  const entry = isObject(value) ? value : {};
  const delay = Number(entry.delaySeconds);
  return {
    id: normalizeId(entry.id, "prompt", index),
    pagePath: optionalText(String(entry.pagePath ?? ""))?.slice(0, 120) ?? "",
    message: optionalText(String(entry.message ?? ""))?.slice(0, 150) ?? "",
    delaySeconds: PROMPT_DELAYS.includes(delay as (typeof PROMPT_DELAYS)[number]) ? (delay as (typeof PROMPT_DELAYS)[number]) : 30,
    autoOpenWidget: entry.autoOpenWidget !== false
  };
}

export function createDefaultDashboardAutomationSettings(input?: {
  requireEmailWhenOffline?: boolean;
  expectedReplyTimeOnline?: WidgetResponseTimeMode;
}): DashboardAutomationSettings {
  return {
    offline: {
      autoReplyEnabled: false,
      autoReplyMessage: "Thanks for reaching out! We're not online right now but we'll get back to you as soon as possible.",
      autoReplyWhen: "team_offline",
      includeExpectedReplyTime: false,
      expectedReplyTimeOnline: input?.expectedReplyTimeOnline ?? "minutes",
      expectedReplyTimeOffline: "hours",
      leadCapture: {
        requireEmailWhenOffline: input?.requireEmailWhenOffline ?? true,
        requireEmailAfterNoResponse: false,
        requireEmailAfterMinutes: 2,
        collectName: false,
        collectPhone: false,
        collectCompany: false,
        formMessage: "Leave your email and we'll get back to you shortly."
      }
    },
    routing: {
      assignRules: [],
      tagRules: []
    },
    speed: {
      faqSuggestionsEnabled: false,
      faqSource: "manual",
      helpCenterUrl: "",
      manualFaqs: [],
      faqFallbackMessage: "None of these help? A team member will be with you shortly."
    },
    proactive: { pagePrompts: [] }
  };
}

export function normalizeDashboardAutomationSettings(
  value: unknown,
  defaults?: Parameters<typeof createDefaultDashboardAutomationSettings>[0]
): DashboardAutomationSettings {
  const base = createDefaultDashboardAutomationSettings({
    expectedReplyTimeOnline: defaults?.expectedReplyTimeOnline,
    requireEmailWhenOffline: defaults?.requireEmailWhenOffline
  });
  const input = isObject(value) ? value : {};
  const offline = isObject(input.offline) ? input.offline : {};
  const leadCapture = isObject(offline.leadCapture) ? offline.leadCapture : {};
  const routing = isObject(input.routing) ? input.routing : {};
  const speed = isObject(input.speed) ? input.speed : {};
  const proactive = isObject(input.proactive) ? input.proactive : {};

  return {
    offline: {
      autoReplyEnabled: Boolean(offline.autoReplyEnabled),
      autoReplyMessage: optionalText(String(offline.autoReplyMessage ?? "")) || base.offline.autoReplyMessage,
      autoReplyWhen:
        offline.autoReplyWhen === "outside_office_hours" || offline.autoReplyWhen === "either"
          ? offline.autoReplyWhen
          : base.offline.autoReplyWhen,
      includeExpectedReplyTime: Boolean(offline.includeExpectedReplyTime),
      expectedReplyTimeOnline: normalizeReplyTime(offline.expectedReplyTimeOnline, base.offline.expectedReplyTimeOnline),
      expectedReplyTimeOffline: normalizeReplyTime(offline.expectedReplyTimeOffline, base.offline.expectedReplyTimeOffline),
      leadCapture: {
        requireEmailWhenOffline:
          typeof leadCapture.requireEmailWhenOffline === "boolean"
            ? leadCapture.requireEmailWhenOffline
            : base.offline.leadCapture.requireEmailWhenOffline,
        requireEmailAfterNoResponse: Boolean(leadCapture.requireEmailAfterNoResponse),
        requireEmailAfterMinutes: RESPONSE_MINUTES.includes(Number(leadCapture.requireEmailAfterMinutes) as 1 | 2 | 3 | 5 | 10)
          ? (Number(leadCapture.requireEmailAfterMinutes) as 1 | 2 | 3 | 5 | 10)
          : base.offline.leadCapture.requireEmailAfterMinutes,
        collectName: Boolean(leadCapture.collectName),
        collectPhone: Boolean(leadCapture.collectPhone),
        collectCompany: Boolean(leadCapture.collectCompany),
        formMessage: optionalText(String(leadCapture.formMessage ?? "")) || base.offline.leadCapture.formMessage
      }
    },
    routing: {
      assignRules: Array.isArray(routing.assignRules) ? routing.assignRules.map(normalizeAssignRule).slice(0, 25) : [],
      tagRules: Array.isArray(routing.tagRules) ? routing.tagRules.map(normalizeTagRule).filter((rule) => rule.tag).slice(0, 25) : []
    },
    speed: {
      faqSuggestionsEnabled: Boolean(speed.faqSuggestionsEnabled),
      faqSource: speed.faqSource === "help_center_url" ? "help_center_url" : "manual",
      helpCenterUrl: optionalText(String(speed.helpCenterUrl ?? ""))?.slice(0, 200) ?? "",
      manualFaqs: Array.isArray(speed.manualFaqs) ? speed.manualFaqs.map(normalizeFaqEntry).slice(0, 20) : [],
      faqFallbackMessage: optionalText(String(speed.faqFallbackMessage ?? "")) || base.speed.faqFallbackMessage
    },
    proactive: {
      pagePrompts: Array.isArray(proactive.pagePrompts) ? proactive.pagePrompts.map(normalizePrompt) : []
    }
  };
}

export function parseDashboardAutomationSettings(
  value: string | null | undefined,
  defaults?: Parameters<typeof createDefaultDashboardAutomationSettings>[0]
) {
  if (!value) {
    return createDefaultDashboardAutomationSettings(defaults);
  }

  try {
    return normalizeDashboardAutomationSettings(JSON.parse(value), defaults);
  } catch {
    return createDefaultDashboardAutomationSettings(defaults);
  }
}

export function serializeDashboardAutomationSettings(
  value: DashboardAutomationSettings,
  defaults?: Parameters<typeof createDefaultDashboardAutomationSettings>[0]
) {
  return JSON.stringify(normalizeDashboardAutomationSettings(value, defaults));
}
