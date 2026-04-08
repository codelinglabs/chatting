import { getPublicAppUrl } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";

export type WidgetInstallTarget =
  | "html"
  | "react"
  | "nextjs"
  | "wordpress"
  | "shopify"
  | "webflow"
  | "other";

const APP_URL = getPublicAppUrl().replace(/\/$/, "");
const DEFAULT_SITE_ID = "your-site-id";

const INSTALL_GUIDANCE: Record<WidgetInstallTarget, string> = {
  html: "Add this to your site's HTML or template just before the closing </body> tag.",
  react: "Add this to a client component so the widget script mounts after the page renders.",
  nextjs: "Drop this into your Next.js app with `next/script` so the widget loads after the page becomes interactive.",
  wordpress: "Paste this into your theme's footer code or your site's code injection area.",
  shopify: "Paste this into your theme code or app embed area, then publish the theme.",
  webflow: "Open Project Settings -> Custom Code -> Footer Code and paste this there.",
  other: "Use this snippet in your site's global custom code area, footer code injection, or body-end injection."
};

function resolvedSiteId(siteId: string | null) {
  return siteId ?? DEFAULT_SITE_ID;
}

export function getWidgetInstallGuidance(target: WidgetInstallTarget) {
  return INSTALL_GUIDANCE[target];
}

export function buildHtmlWidgetSnippet(siteId: string | null) {
  return `<script\n  src="${escapeHtml(APP_URL)}/widget.js"\n  data-site-id="${escapeHtml(resolvedSiteId(siteId))}"\n></script>`;
}

export function buildReactWidgetSnippet(siteId: string | null) {
  return `import { useEffect } from "react";

export function ChattingWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "${APP_URL}/widget.js";
    script.dataset.siteId = "${resolvedSiteId(siteId)}";
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}`;
}

export function buildNextJsWidgetSnippet(siteId: string | null) {
  return `import Script from "next/script";

export default function ChattingScript() {
  return (
    <Script
      src="${APP_URL}/widget.js"
      data-site-id="${resolvedSiteId(siteId)}"
      strategy="afterInteractive"
    />
  );
}`;
}

export function getWidgetInstallSnippet(target: WidgetInstallTarget, siteId: string | null) {
  if (target === "react") {
    return buildReactWidgetSnippet(siteId);
  }

  if (target === "nextjs") {
    return buildNextJsWidgetSnippet(siteId);
  }

  return buildHtmlWidgetSnippet(siteId);
}
