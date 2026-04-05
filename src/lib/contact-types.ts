import type { BillingPlanKey } from "@/lib/billing-plans";

export type ContactStatusColor = "blue" | "purple" | "green" | "amber" | "gray";

export type ContactStatusDefinition = {
  key: string;
  label: string;
  color: ContactStatusColor;
};

export type ContactCustomFieldType = "text" | "dropdown" | "date" | "number" | "url";

export type ContactCustomFieldDefinition = {
  id: string;
  key: string;
  label: string;
  type: ContactCustomFieldType;
  options: string[];
  prefix: string | null;
};

export type ContactDataRetention = "forever" | "1y" | "2y" | "3y";

export type ContactWorkspaceSettings = {
  statuses: ContactStatusDefinition[];
  customFields: ContactCustomFieldDefinition[];
  dataRetention: ContactDataRetention;
};

export type ContactPlanLimits = {
  fullProfiles: boolean;
  exportEnabled: boolean;
  apiEnabled: boolean;
  customStatusesLimit: number | null;
  customFieldsLimit: number | null;
};

export type ContactNote = {
  id: string;
  body: string;
  authorUserId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactLocation = {
  city: string | null;
  region: string | null;
  country: string | null;
};

export type ContactSource = {
  firstLandingPage: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

export type ContactPageHistoryEntry = {
  page: string;
  seenAt: string;
  durationSeconds: number;
};

export type ContactConversationHistoryEntry = {
  id: string;
  title: string;
  status: "open" | "resolved";
  createdAt: string;
  assignedUserId: string | null;
  messageCount: number;
};

export type ContactSummary = {
  id: string;
  siteId: string;
  siteName: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  role: string | null;
  avatarUrl: string | null;
  status: string;
  tags: string[];
  customFields: Record<string, string>;
  firstSeenAt: string;
  lastSeenAt: string;
  totalVisits: number;
  totalPageViews: number;
  conversationCount: number;
  avgSessionSeconds: number;
  location: ContactLocation;
  source: ContactSource;
  latestConversationId: string | null;
  latestSessionId: string | null;
  notes: ContactNote[];
  pageHistory: ContactPageHistoryEntry[];
};

export type ContactDetail = ContactSummary & {
  conversations: ContactConversationHistoryEntry[];
};

export type ContactListPayload = {
  contacts: ContactSummary[];
  settings: ContactWorkspaceSettings;
  planKey: BillingPlanKey;
  limits: ContactPlanLimits;
  tagOptions: string[];
};

export type ContactDetailPayload = {
  contact: ContactDetail;
  settings: ContactWorkspaceSettings;
  planKey: BillingPlanKey;
  limits: ContactPlanLimits;
  tagOptions: string[];
};
