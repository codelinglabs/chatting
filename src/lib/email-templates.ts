import {
  renderStyledEmailLayout,
  renderStyledEmailTextLayout,
  type StyledEmailSection
} from "@/lib/email-layout";
import { escapeHtml, optionalText } from "@/lib/utils";

export type DashboardEmailTemplateKey =
  | "offline_reply"
  | "conversation_transcript"
  | "welcome_email"
  | "follow_up_email"
  | "satisfaction_survey";

export type DashboardEmailTemplateIcon = "mail" | "transcript" | "welcome" | "follow_up" | "survey";

export type DashboardEmailTemplate = {
  key: DashboardEmailTemplateKey;
  name: string;
  description: string;
  trigger: string;
  icon: DashboardEmailTemplateIcon;
  subject: string;
  body: string;
  enabled: boolean;
  updatedAt: string | null;
};

export type DashboardEmailTemplateVariable = {
  token: string;
  description: string;
  example: string;
};

export type DashboardEmailTemplatePreviewContext = {
  visitorName: string;
  visitorEmail: string;
  teamName: string;
  agentName: string;
  companyName: string;
  conversationLink: string;
  transcript: string;
  unsubscribeLink: string;
};

export type DashboardEmailTemplateSection = StyledEmailSection;

type StoredDashboardEmailTemplate = {
  key: DashboardEmailTemplateKey;
  subject?: string;
  body?: string;
  enabled?: boolean;
  updatedAt?: string | null;
};

type TemplateDefinition = Omit<DashboardEmailTemplate, "subject" | "body" | "enabled" | "updatedAt"> & {
  defaultSubject: string;
  defaultBody: string;
};

const TEMPLATE_DEFINITIONS: Record<DashboardEmailTemplateKey, TemplateDefinition> = {
  offline_reply: {
    key: "offline_reply",
    name: "Offline reply",
    description: "Sent when team replies while visitor is offline",
    trigger: "Automatic when visitor offline",
    icon: "mail",
    defaultSubject: "{{team_name}} replied to your message",
    defaultBody: `Hi {{visitor_name}},

{{agent_name}} from {{team_name}} just replied to your message.

You can continue the conversation here:
{{conversation_link}}

Reply from the team:
{{transcript}}

Best,
{{team_name}}`
  },
  conversation_transcript: {
    key: "conversation_transcript",
    name: "Conversation transcript",
    description: "Emailed conversation history to visitors",
    trigger: "On request or after resolution",
    icon: "transcript",
    defaultSubject: "Your {{team_name}} conversation transcript",
    defaultBody: `Hi {{visitor_name}},

Here is a copy of your recent conversation with {{team_name}}.

{{transcript}}

If you need anything else, you can pick the thread back up here:
{{conversation_link}}

{{team_name}}`
  },
  welcome_email: {
    key: "welcome_email",
    name: "Welcome email",
    description: "Sent to new identified visitors",
    trigger: "When email is captured",
    icon: "welcome",
    defaultSubject: "Welcome to {{company_name}}",
    defaultBody: `Hi {{visitor_name}},

Thanks for reaching out to {{company_name}}. We're glad you're here.

If you ever want to continue the conversation, you can jump back in here:
{{conversation_link}}

Best,
{{team_name}}`
  },
  follow_up_email: {
    key: "follow_up_email",
    name: "Follow-up email",
    description: "Sent after a conversation ends",
    trigger: "Manual or scheduled",
    icon: "follow_up",
    defaultSubject: "Checking in from {{team_name}}",
    defaultBody: `Hi {{visitor_name}},

Just checking in after your chat with {{agent_name}}.

If anything else comes up, you can continue the conversation here:
{{conversation_link}}

Thanks,
{{team_name}}`
  },
  satisfaction_survey: {
    key: "satisfaction_survey",
    name: "Satisfaction survey",
    description: "Request feedback after resolution",
    trigger: "Automatic after resolve",
    icon: "survey",
    defaultSubject: "How did we do?",
    defaultBody: `Hi {{visitor_name}},

Thanks for chatting with {{team_name}}.

We'd love your feedback on the conversation with {{agent_name}}.
Please reply to this email or continue the conversation here:
{{conversation_link}}

If you'd rather not receive follow-up emails, you can unsubscribe here:
{{unsubscribe_link}}`
  }
};

const TEMPLATE_ORDER: DashboardEmailTemplateKey[] = [
  "offline_reply",
  "conversation_transcript",
  "welcome_email",
  "follow_up_email",
  "satisfaction_survey"
];

const VARIABLE_TOKEN_MAP: Array<{
  token: keyof DashboardEmailTemplatePreviewContext;
  placeholder: string;
}> = [
  { token: "visitorName", placeholder: "{{visitor_name}}" },
  { token: "visitorEmail", placeholder: "{{visitor_email}}" },
  { token: "teamName", placeholder: "{{team_name}}" },
  { token: "agentName", placeholder: "{{agent_name}}" },
  { token: "companyName", placeholder: "{{company_name}}" },
  { token: "conversationLink", placeholder: "{{conversation_link}}" },
  { token: "transcript", placeholder: "{{transcript}}" },
  { token: "unsubscribeLink", placeholder: "{{unsubscribe_link}}" }
];

export const EMAIL_TEMPLATE_VARIABLES: DashboardEmailTemplateVariable[] = VARIABLE_TOKEN_MAP.map((item) => ({
  token: item.placeholder,
  description:
    item.placeholder === "{{visitor_name}}"
      ? "Visitor's name"
      : item.placeholder === "{{visitor_email}}"
        ? "Visitor's email"
        : item.placeholder === "{{team_name}}"
          ? "Your team name"
          : item.placeholder === "{{agent_name}}"
            ? "Replying agent's name"
            : item.placeholder === "{{company_name}}"
              ? "Your company name"
              : item.placeholder === "{{conversation_link}}"
                ? "Link to continue the conversation"
                : item.placeholder === "{{transcript}}"
                  ? "Formatted conversation history"
                  : "Opt-out link",
  example:
    item.placeholder === "{{visitor_name}}"
      ? "Alex"
      : item.placeholder === "{{visitor_email}}"
        ? "alex@example.com"
        : item.placeholder === "{{team_name}}"
          ? "Acme Support"
          : item.placeholder === "{{agent_name}}"
            ? "Sarah"
            : item.placeholder === "{{company_name}}"
              ? "Acme Inc"
              : item.placeholder === "{{conversation_link}}"
                ? "https://chatly.example/conversation/123"
                : item.placeholder === "{{transcript}}"
                  ? "Visitor: Hi there\nTeam: Happy to help."
                  : "https://chatly.example/unsubscribe"
}));

function capitalizeWord(value: string) {
  if (!value) {
    return value;
  }

  return `${value[0]?.toUpperCase() || ""}${value.slice(1).toLowerCase()}`;
}

function companyNameFromEmail(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] || "";
  const root = domain.split(".")[0] || "chatly";
  const companyName = root
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => capitalizeWord(part))
    .join(" ");

  return companyName === "Chatly" ? "Chatting" : companyName;
}

function buildDefaultTemplate(key: DashboardEmailTemplateKey): DashboardEmailTemplate {
  const definition = TEMPLATE_DEFINITIONS[key];

  return {
    key,
    name: definition.name,
    description: definition.description,
    trigger: definition.trigger,
    icon: definition.icon,
    subject: definition.defaultSubject,
    body: definition.defaultBody,
    enabled: true,
    updatedAt: null
  };
}

function normalizeStoredTemplate(input: StoredDashboardEmailTemplate | null | undefined) {
  if (!input) {
    return null;
  }

  if (!TEMPLATE_ORDER.includes(input.key)) {
    return null;
  }

  return {
    key: input.key,
    subject: optionalText(input.subject) ?? buildDefaultTemplate(input.key).subject,
    body: optionalText(input.body) ?? buildDefaultTemplate(input.key).body,
    enabled: input.enabled ?? true,
    updatedAt: optionalText(input.updatedAt) ?? null
  };
}

export function getDefaultDashboardEmailTemplates() {
  return TEMPLATE_ORDER.map((key) => buildDefaultTemplate(key));
}

export function parseDashboardEmailTemplates(value: string | null | undefined) {
  let stored: StoredDashboardEmailTemplate[] = [];

  if (value) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        stored = parsed as StoredDashboardEmailTemplate[];
      }
    } catch (error) {
      stored = [];
    }
  }

  const byKey = new Map<DashboardEmailTemplateKey, StoredDashboardEmailTemplate>();

  for (const entry of stored) {
    const normalized = normalizeStoredTemplate(entry);
    if (normalized) {
      byKey.set(normalized.key, normalized);
    }
  }

  return TEMPLATE_ORDER.map((key) => {
    const defaults = buildDefaultTemplate(key);
    const current = byKey.get(key);

    return current
      ? {
          ...defaults,
          subject: current.subject || defaults.subject,
          body: current.body || defaults.body,
          enabled: current.enabled ?? defaults.enabled,
          updatedAt: current.updatedAt ?? defaults.updatedAt
        }
      : defaults;
  });
}

export function serializeDashboardEmailTemplates(templates: DashboardEmailTemplate[]) {
  const safeTemplates = TEMPLATE_ORDER.map((key) => {
    const current = templates.find((template) => template.key === key);
    const defaults = buildDefaultTemplate(key);

    return {
      key,
      subject: optionalText(current?.subject) ?? defaults.subject,
      body: optionalText(current?.body) ?? defaults.body,
      enabled: current?.enabled ?? true,
      updatedAt: optionalText(current?.updatedAt) ?? null
    };
  });

  return JSON.stringify(safeTemplates);
}

function replaceTemplateVariables(
  value: string,
  context: DashboardEmailTemplatePreviewContext,
  highlight = false
) {
  let output = value;

  for (const variable of VARIABLE_TOKEN_MAP) {
    const replacement = String(context[variable.token]);
    output = output.split(variable.placeholder).join(
      highlight
        ? `<mark style="background:#fef3c7;color:#92400e;padding:0 2px;border-radius:4px;">${escapeHtml(replacement)}</mark>`
        : escapeHtml(replacement)
    );
  }

  return output;
}

function renderBodyHtml(value: string, context: DashboardEmailTemplatePreviewContext, highlightVariables: boolean) {
  const codeBlocks: string[] = [];
  let html = escapeHtml(value);

  html = html.replace(/```([\s\S]*?)```/g, (_match, code) => {
    const token = `__CHATLY_CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<pre style="margin:16px 0;overflow:auto;border-radius:8px;background:#0f172a;padding:16px;color:#e2e8f0;"><code>${String(
        code
      ).trim()}</code></pre>`
    );
    return token;
  });

  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
    (_match, alt, url) =>
      `<figure style="margin:16px 0;"><img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;" />${
        alt ? `<figcaption style="margin-top:6px;font-size:12px;color:#64748b;">${alt}</figcaption>` : ""
      }</figure>`
  );

  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_match, label, url) =>
      `<a href="${url}" style="color:#2563eb;text-decoration:none;">${label}</a>`
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<u>$1</u>");
  html = html.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  html = replaceTemplateVariables(html, context, highlightVariables);
  html = html.replace(/\n/g, "<br />");

  for (const [index, block] of codeBlocks.entries()) {
    html = html.replace(`__CHATLY_CODE_BLOCK_${index}__`, block);
  }

  return html;
}

export function renderDashboardEmailTemplate(
  template: Pick<DashboardEmailTemplate, "subject" | "body">,
  context: DashboardEmailTemplatePreviewContext,
  options?: {
    highlightVariables?: boolean;
    includeShell?: boolean;
    sections?: DashboardEmailTemplateSection[];
  }
) {
  const highlightVariables = options?.highlightVariables ?? false;
  const sections = options?.sections ?? [];
  const bodyText = VARIABLE_TOKEN_MAP.reduce((text, variable) => {
    return text.split(variable.placeholder).join(String(context[variable.token]));
  }, template.body);

  return {
    subject: VARIABLE_TOKEN_MAP.reduce((text, variable) => {
      return text.split(variable.placeholder).join(String(context[variable.token]));
    }, template.subject),
    bodyText: renderStyledEmailTextLayout({
      contentText: bodyText,
      sections
    }),
    bodyHtml: renderStyledEmailLayout({
      contentHtml: renderBodyHtml(template.body, context, highlightVariables),
      sections,
      includeShell: options?.includeShell ?? false
    })
  };
}

export function buildDashboardEmailTemplatePreviewContext(input: {
  profileEmail: string;
  profileName: string;
}) {
  const companyName = companyNameFromEmail(input.profileEmail) || "Chatting";
  const agentName = input.profileName.trim().split(/\s+/)[0] || "Sarah";
  const teamName = companyName === "Chatting" ? "Chatting Team" : `${companyName} Support`;

  return {
    visitorName: "Alex",
    visitorEmail: "alex@example.com",
    teamName,
    agentName,
    companyName,
    conversationLink: "https://chatting.example/conversation/123",
    transcript: "Alex: Hi there\nSarah: Happy to help. What can I do for you?",
    unsubscribeLink: "https://chatly.example/unsubscribe"
  };
}

export function formatEmailTemplateTimestamp(value: string | null) {
  if (!value) {
    return "Default template";
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
