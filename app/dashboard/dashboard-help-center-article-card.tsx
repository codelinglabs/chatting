"use client";

import type { DashboardHelpCenterArticle } from "@/lib/data/settings-types";
import { Button } from "../components/ui/Button";
import { CopyIcon, ExternalLinkIcon } from "./dashboard-ui";

function formatUpdatedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function excerpt(body: string) {
  const preview = body.replace(/\s+/g, " ").trim();
  return preview.length > 180 ? `${preview.slice(0, 177)}...` : preview;
}

export function DashboardHelpCenterArticleCard({
  article,
  publicPath,
  canManage,
  onCopyLink,
  onEdit,
  onDelete
}: {
  article: DashboardHelpCenterArticle;
  publicPath: string | null;
  canManage: boolean;
  onCopyLink: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900">{article.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">/{article.slug}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{excerpt(article.body)}</p>
          <p className="mt-3 text-xs text-slate-400">Updated {formatUpdatedDate(article.updatedAt)}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button type="button" size="md" variant="secondary" className="h-9 px-3" onClick={onCopyLink}>
            <CopyIcon className="h-4 w-4" />
            Copy link
          </Button>
          {publicPath ? (
            <a href={publicPath} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
              <ExternalLinkIcon className="h-4 w-4" />
              Open
            </a>
          ) : null}
          {canManage ? (
            <>
              <Button type="button" size="md" variant="secondary" className="h-9 px-3" onClick={onEdit}>
                Edit
              </Button>
              <Button type="button" size="md" variant="secondary" className="h-9 px-3" onClick={onDelete}>
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
