import type { Site } from "@/lib/types";
import { buildHtmlWidgetSnippet } from "@/lib/widget-installation";

export function getWidgetSnippet(site: Site) {
  return buildHtmlWidgetSnippet(site.id);
}
