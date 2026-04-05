import type { WidgetOperatingHours, WidgetResponseTimeMode } from "@/lib/types";

export type DashboardAutomationAwayWhen = "team_offline" | "outside_office_hours" | "either";

export type DashboardAutomationRuleCondition =
  | "page_url_contains"
  | "page_url_exact"
  | "page_url_starts_with"
  | "visitor_location"
  | "first_message_contains"
  | "visitor_tag"
  | "referrer_contains"
  | "custom_field_equals";

export type DashboardAutomationPromptDelaySeconds = 0 | 10 | 30 | 60 | 120 | 300;
export type DashboardAutomationFaqSource = "help_center_url" | "manual";

export type DashboardAutomationAssignRule = {
  id: string;
  condition: DashboardAutomationRuleCondition;
  value: string;
  target: { type: "round_robin" } | { type: "member"; memberId: string };
};

export type DashboardAutomationTagRule = {
  id: string;
  condition: DashboardAutomationRuleCondition;
  value: string;
  tag: string;
};

export type DashboardAutomationFaqEntry = {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  link: string;
};

export type DashboardAutomationPagePrompt = {
  id: string;
  pagePath: string;
  message: string;
  delaySeconds: DashboardAutomationPromptDelaySeconds;
  autoOpenWidget: boolean;
};

export type DashboardAutomationSettings = {
  offline: {
    autoReplyEnabled: boolean;
    autoReplyMessage: string;
    autoReplyWhen: DashboardAutomationAwayWhen;
    includeExpectedReplyTime: boolean;
    expectedReplyTimeOnline: WidgetResponseTimeMode;
    expectedReplyTimeOffline: WidgetResponseTimeMode;
    leadCapture: {
      requireEmailWhenOffline: boolean;
      requireEmailAfterNoResponse: boolean;
      requireEmailAfterMinutes: 1 | 2 | 3 | 5 | 10;
      collectName: boolean;
      collectPhone: boolean;
      collectCompany: boolean;
      formMessage: string;
    };
  };
  routing: {
    assignRules: DashboardAutomationAssignRule[];
    tagRules: DashboardAutomationTagRule[];
  };
  speed: {
    faqSuggestionsEnabled: boolean;
    faqSource: DashboardAutomationFaqSource;
    helpCenterUrl: string;
    manualFaqs: DashboardAutomationFaqEntry[];
    faqFallbackMessage: string;
  };
  proactive: {
    pagePrompts: DashboardAutomationPagePrompt[];
  };
};

export type DashboardAutomationContext = {
  primarySiteId: string | null;
  brandColor: string;
  widgetTitle: string;
  officeHoursEnabled: boolean;
  officeHoursTimezone: string | null;
  operatingHours: WidgetOperatingHours | null;
  defaultWelcomeMessage: string;
  tagOptions: string[];
  helpCenterPath: string | null;
  helpCenterArticleCount: number;
};
