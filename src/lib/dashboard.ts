import type { Site } from "@/lib/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

const BANNER_MESSAGES = {
  "no-email": "This conversation does not have an email yet.",
  "empty-reply": "Reply content cannot be empty.",
  "send-failed": "Reply email could not be sent. Check your Resend configuration and try again.",
  "not-found": "That conversation does not belong to this account.",
  "missing-site": "Site name is required to create a new widget.",
  "reply-sent": "Reply sent and saved to the thread.",
  "email-saved": "Email saved to the conversation.",
  "site-created": "New site created. Copy the snippet into your product."
} as const;

export function getWidgetSnippet(site: Site) {
  return `<script
  src="${APP_URL}/widget.js"
  data-site-id="${site.id}"
  data-brand-color="${site.brandColor}"
  data-greeting="${site.greetingText}"
></script>`;
}

export function getDashboardBanner(error?: string, success?: string) {
  if (error && error in BANNER_MESSAGES) {
    return BANNER_MESSAGES[error as keyof typeof BANNER_MESSAGES];
  }

  if (success && success in BANNER_MESSAGES) {
    return BANNER_MESSAGES[success as keyof typeof BANNER_MESSAGES];
  }

  return null;
}
