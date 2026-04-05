"use client";

import { useState } from "react";
import type { DashboardHelpCenterArticle } from "@/lib/data/settings-types";
import type { Site } from "@/lib/types";
import { Button, ButtonLink } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";
import { DASHBOARD_SELECT_CLASS } from "./dashboard-controls";
import { DashboardHelpCenterArticleCard } from "./dashboard-help-center-article-card";
import { DashboardHelpCenterModal } from "./dashboard-help-center-modal";
import { DashboardModal } from "./dashboard-modal";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardEmptyState
} from "./dashboard-settings-shared";

const EMPTY_ARTICLE = { title: "", slug: "", body: "" };

function publicPath(siteId: string | null, slug?: string) {
  if (!siteId) {
    return null;
  }

  return slug ? `/help/${siteId}/${slug}` : `/help/${siteId}`;
}

export function DashboardHelpCenterManager({
  initialArticles,
  initialSites,
  canManage
}: {
  initialArticles: DashboardHelpCenterArticle[];
  initialSites: Site[];
  canManage: boolean;
}) {
  const { showToast } = useToast();
  const [articles, setArticles] = useState(initialArticles);
  const [selectedSiteId, setSelectedSiteId] = useState(initialSites[0]?.id ?? "");
  const [editingArticle, setEditingArticle] = useState<DashboardHelpCenterArticle | null>(null);
  const [draft, setDraft] = useState(EMPTY_ARTICLE);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<DashboardHelpCenterArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function saveArticle() {
    if (saving) return;
    setSaving(true);

    try {
      const response = await fetch("/dashboard/help-center/articles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: editingArticle ? "update" : "create", id: editingArticle?.id, ...draft })
      });
      const payload = (await response.json()) as { ok?: boolean; article?: DashboardHelpCenterArticle; error?: string };
      if (!response.ok || !payload.ok || !payload.article) throw new Error(payload.error || "help-center-failed");

      setArticles((current) => {
        const next = current.filter((article) => article.id !== payload.article!.id);
        return [payload.article!, ...next].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      });
      setEditorOpen(false);
      setEditingArticle(null);
      setDraft(EMPTY_ARTICLE);
      showToast("success", editingArticle ? "Article updated" : "Article published");
    } catch (error) {
      const message = error instanceof Error && error.message === "slug-taken"
        ? "That slug is already in use."
        : "We couldn't save that article.";
      showToast("error", message, "Check the title, slug, and article body, then try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle() {
    if (!deletingArticle || deleting) return;
    setDeleting(true);

    try {
      const response = await fetch("/dashboard/help-center/articles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", id: deletingArticle.id })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "help-center-failed");

      setArticles((current) => current.filter((article) => article.id !== deletingArticle.id));
      setDeletingArticle(null);
      showToast("success", "Article deleted");
    } catch {
      showToast("error", "We couldn't delete that article.", "Please try again in a moment.");
    } finally {
      setDeleting(false);
    }
  }

  async function copyLink(path: string | null) {
    if (!path) {
      showToast("error", "Add a site first so there's a public help-center URL to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      showToast("success", "Public link copied");
    } catch {
      showToast("error", "We couldn't copy that link.", "Clipboard access may be blocked in this browser.");
    }
  }

  const selectedPublicPath = publicPath(selectedSiteId);

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Public help center"
        description="Choose which site URL you want to use when copying public article links."
        actions={canManage ? <Button type="button" size="md" onClick={() => { setEditingArticle(null); setDraft(EMPTY_ARTICLE); setEditorOpen(true); }}>New article</Button> : undefined}
      >
        <SettingsCardBody className="grid items-start gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <label className="block text-sm font-medium text-slate-700">Site for copied links</label>
            <select value={selectedSiteId} onChange={(event) => setSelectedSiteId(event.currentTarget.value)} className={`mt-3 ${DASHBOARD_SELECT_CLASS}`}>
              {initialSites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
            </select>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
            <p className="text-sm font-medium text-slate-800">Public index</p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
              <p className="break-all font-mono text-xs text-slate-500">{selectedPublicPath ?? "Add a site to publish your help center."}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button type="button" size="md" variant="secondary" fullWidth onClick={() => void copyLink(selectedPublicPath)} className="sm:w-auto">Copy index link</Button>
              {selectedPublicPath ? <ButtonLink href={selectedPublicPath} target="_blank" rel="noreferrer" size="md" variant="secondary" fullWidth className="sm:w-auto">Open help center</ButtonLink> : null}
            </div>
          </div>
        </SettingsCardBody>
      </SettingsCard>

      <SettingsCard title="Articles" description="Keep the answers short, clear, and linkable from live chat replies.">
        {articles.length ? (
          <SettingsCardBody className="space-y-3">
            {articles.map((article) => (
              <DashboardHelpCenterArticleCard
                key={article.id}
                article={article}
                publicPath={publicPath(selectedSiteId, article.slug)}
                canManage={canManage}
                onCopyLink={() => void copyLink(publicPath(selectedSiteId, article.slug))}
                onEdit={() => { setEditingArticle(article); setDraft({ title: article.title, slug: article.slug, body: article.body }); setEditorOpen(true); }}
                onDelete={() => setDeletingArticle(article)}
              />
            ))}
          </SettingsCardBody>
        ) : (
          <SettingsCardEmptyState>
            No help-center articles yet. Start with setup, billing, and common pre-sales questions.
          </SettingsCardEmptyState>
        )}
      </SettingsCard>

      {editorOpen ? <DashboardHelpCenterModal title={editingArticle ? "Edit article" : "New article"} values={draft} saving={saving} onChange={setDraft} onClose={() => { if (!saving) { setEditorOpen(false); setEditingArticle(null); setDraft(EMPTY_ARTICLE); } }} onSave={saveArticle} /> : null}
      {deletingArticle ? (
        <DashboardModal title="Delete article" description="This removes it from the public help center for every site in the workspace." onClose={deleting ? () => {} : () => setDeletingArticle(null)} widthClass="max-w-[480px]">
          <div className="px-6 py-5 text-sm leading-6 text-slate-600">Delete <span className="font-semibold text-slate-900">{deletingArticle.title}</span>?</div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button type="button" size="md" variant="secondary" onClick={() => setDeletingArticle(null)} disabled={deleting}>Cancel</Button>
            <Button type="button" size="md" onClick={() => void deleteArticle()} disabled={deleting}>Delete</Button>
          </div>
        </DashboardModal>
      ) : null}
    </div>
  );
}
