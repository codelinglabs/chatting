import { getPublicAppUrl } from "@/lib/env";

export const SITE_SEO_TITLE = "Live Chat Software for Small Teams | Chatting";
export const SITE_SEO_DESCRIPTION =
  "Chatting is live chat software for small teams that want to answer website visitors faster, support customers in real time, and turn more conversations into revenue.";
export const HOME_PAGE_SEO_DESCRIPTION =
  "Answer website visitors in real time with a lightweight live chat widget, shared inbox, and proactive visitor insights for small teams.";

export function getSiteBaseUrl() {
  return getPublicAppUrl().replace(/\/$/, "");
}
