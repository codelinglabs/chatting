"use client";

import { useEffect, useState } from "react";
import { matchAutomationFaqs, scoreAutomationFaqMatch } from "@/lib/automation-faq-matching";
import type { DashboardAutomationContext, DashboardAutomationFaqEntry, DashboardAutomationFaqSource } from "@/lib/data/settings-types";
import { Input } from "../components/ui/Input";
import { resolveHelpCenterArticleCount } from "./dashboard-settings-automation-faq-helpers";
import { AutomationSectionLabel } from "./dashboard-settings-automation-faq-ui";
import { AutomationFaqPreviewWidget } from "./dashboard-settings-automation-faq-preview-widget";

type PreviewArticle = {
  id: string;
  title: string;
  body: string;
};

type PreviewMatch = {
  id: string;
  title: string;
  previewText: string;
  score: number;
};

export function AutomationFaqPreview({
  source,
  helpCenterUrl,
  manualFaqs,
  fallbackMessage,
  context
}: {
  source: DashboardAutomationFaqSource;
  helpCenterUrl: string;
  manualFaqs: DashboardAutomationFaqEntry[];
  fallbackMessage: string;
  context: DashboardAutomationContext | undefined;
}) {
  const [query, setQuery] = useState("how do i reset my password");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [helpCenterArticles, setHelpCenterArticles] = useState<PreviewArticle[]>([]);
  const [loadingHelpCenterArticles, setLoadingHelpCenterArticles] = useState(false);
  const resolvedHelpCenterArticleCount = resolveHelpCenterArticleCount(helpCenterUrl, context);
  const matches = resolvePreviewMatches({
    source,
    manualFaqs,
    helpCenterArticles,
    query: debouncedQuery
  }).slice(0, 2);
  const emptyMessage = source === "help_center_url" && resolvedHelpCenterArticleCount === null
    ? "Preview works with manual FAQs or your Chatting help center URL."
    : "No matching FAQs yet. Visitors would go straight to your team.";
  const previewMessage = debouncedQuery.trim() || "How do I reset my password?";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (source !== "help_center_url" || !resolvedHelpCenterArticleCount) {
      setHelpCenterArticles([]);
      setLoadingHelpCenterArticles(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setLoadingHelpCenterArticles(true);
    void fetch("/dashboard/help-center/preview", {
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) {
          return [];
        }

        const payload = (await response.json()) as { articles?: PreviewArticle[] };
        return Array.isArray(payload.articles) ? payload.articles : [];
      })
      .then((articles) => {
        if (!cancelled) {
          setHelpCenterArticles(articles.map(({ id, title, body }) => ({ id, title, body })));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
          setHelpCenterArticles([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingHelpCenterArticles(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [resolvedHelpCenterArticleCount, source]);

  return (
    <div className="hidden border-t border-slate-200 px-6 py-5 md:block">
      <AutomationSectionLabel label="Preview" />
      <div className="mt-4 space-y-4">
        <AutomationFaqPreviewWidget
          previewMessage={previewMessage}
          loading={loadingHelpCenterArticles}
          matches={matches}
          emptyMessage={emptyMessage}
          fallbackMessage={fallbackMessage}
          brandColor={context?.brandColor ?? "#2563EB"}
          widgetTitle={context?.widgetTitle ?? "Talk to the team"}
        />
        <div>
          <p className="mb-2 text-sm text-slate-500">Test it: Type a message to see matching FAQs</p>
          <Input value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
        </div>
      </div>
    </div>
  );
}

function resolvePreviewMatches({
  source,
  manualFaqs,
  helpCenterArticles,
  query,
}: {
  source: DashboardAutomationFaqSource;
  manualFaqs: DashboardAutomationFaqEntry[];
  helpCenterArticles: PreviewArticle[];
  query: string;
}): PreviewMatch[] {
  const search = query.trim().toLowerCase();

  if (source === "manual") {
    return matchAutomationFaqs(manualFaqs, search, {
      includeAllWhenEmpty: true,
      limit: manualFaqs.length
    }).map((entry) => ({
      id: entry.id,
      title: entry.question,
      previewText: truncatePreviewText(entry.answer),
      score: entry.score
    }));
  }

  return helpCenterArticles
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        previewText: truncatePreviewText(entry.body),
        score: previewMatchScore(`${entry.title} ${entry.body}`.toLowerCase(), search)
      }))
      .filter((entry) => !search || entry.score > 0)
      .sort((left, right) => right.score - left.score);
}

function previewMatchScore(value: string, search: string) {
  if (!search) {
    return 1;
  }

  return scoreAutomationFaqMatch(value, search);
}

function truncatePreviewText(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 96 ? `${normalized.slice(0, 95)}…` : normalized;
}
