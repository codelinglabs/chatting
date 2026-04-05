"use client";

import { useState } from "react";
import type { DashboardAutomationContext, DashboardAutomationFaqEntry, DashboardAutomationSettings } from "@/lib/data/settings-types";
import { ButtonLink } from "../components/ui/Button";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { useToast } from "../ui/toast-provider";
import { AutomationFaqPreview } from "./dashboard-settings-automation-faq-preview";
import { AutomationHelpCircleIcon, AutomationHowItWorksPanel, AutomationSectionLabel } from "./dashboard-settings-automation-faq-ui";
import { ToggleSwitch } from "./dashboard-settings-shared";
import { PlusIcon } from "./dashboard-ui";
import { AutomationFaqEntryCard } from "./dashboard-settings-automation-faq-entry-card";
import { AutomationEmptyState, AutomationSectionCard } from "./dashboard-settings-automation-ui";
import { DashboardFaqEntryModal, type FaqDraft } from "./dashboard-settings-faq-entry-modal";

const EMPTY_FAQ: FaqDraft = { question: "", keywords: "", answer: "", link: "" };

function toDraft(entry: DashboardAutomationFaqEntry): FaqDraft {
  return { question: entry.question, keywords: entry.keywords.join(", "), answer: entry.answer, link: entry.link };
}

export function SettingsAutomationFaqSection({
  automation,
  context,
  growthUnlocked,
  onChange,
  onAnnounce
}: {
  automation: DashboardAutomationSettings;
  context: DashboardAutomationContext | undefined;
  growthUnlocked: boolean;
  onChange: (updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings) => void;
  onAnnounce: (message: string) => void;
}) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState(EMPTY_FAQ);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const faqEntries = automation.speed.manualFaqs;
  const fallbackCount = automation.speed.faqFallbackMessage.length;

  function updateSpeed(
    updater: (current: DashboardAutomationSettings["speed"]) => DashboardAutomationSettings["speed"]
  ) {
    onChange((current) => ({
      ...current,
      speed: {
        ...updater(current.speed),
        faqSource: "manual"
      }
    }));
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setDraft(EMPTY_FAQ);
  }

  function openForCreate() {
    setEditingId(null);
    setDraft(EMPTY_FAQ);
    setOpen(true);
  }

  function saveFaqEntry() {
    const keywords = draft.keywords.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (!draft.question.trim() || !draft.answer.trim() || !keywords.length) {
      showToast("error", "Add a question, keywords, and an answer.", "Those fields help us match and display FAQ suggestions.");
      return;
    }

    const nextEntry: DashboardAutomationFaqEntry = {
      id: editingId ?? `faq_${Math.random().toString(36).slice(2, 10)}`,
      question: draft.question.trim(),
      keywords: keywords.slice(0, 8),
      answer: draft.answer.trim(),
      link: draft.link.trim()
    };

    updateSpeed((current) => ({
      ...current,
      manualFaqs: editingId
        ? current.manualFaqs.map((entry) => (entry.id === editingId ? nextEntry : entry))
        : [nextEntry, ...current.manualFaqs]
    }));
    closeModal();
    onAnnounce(editingId ? "FAQ entry updated." : "FAQ entry added.");
  }

  return (
    <AutomationSectionCard title="FAQ suggestions" description="Suggest answers before connecting to your team" icon={AutomationHelpCircleIcon}>
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Enable suggestions</h4>
            <p className="mt-1 text-sm text-slate-500">Show matching FAQs before a visitor reaches your team.</p>
          </div>
          <ToggleSwitch
            checked={automation.speed.faqSuggestionsEnabled}
            onChange={(checked) => updateSpeed((current) => ({ ...current, faqSuggestionsEnabled: checked }))}
            label="Enable FAQ suggestions"
            disabled={!growthUnlocked}
          />
        </div>

        {!growthUnlocked ? (
          <div className="border-t border-slate-200 px-6 py-5">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900">This is a Growth feature</p>
                  <p className="mt-1 text-sm text-blue-700">Upgrade to show FAQ suggestions to visitors before they connect to your team.</p>
                </div>
                <ButtonLink href="/dashboard/settings?section=billing" size="md" variant="secondary" className="border-blue-300 bg-white text-blue-700 hover:bg-blue-100">
                  Upgrade to Growth →
                </ButtonLink>
              </div>
            </div>
          </div>
        ) : null}
        {!automation.speed.faqSuggestionsEnabled ? null : (
          <>
            <div className="border-t border-slate-200 px-6 py-5"><AutomationHowItWorksPanel /></div>
            <div className="space-y-4 border-t border-slate-200 px-6 py-5">
              {faqEntries.length ? faqEntries.map((entry) => <AutomationFaqEntryCard key={entry.id} entry={entry} onEdit={() => { setEditingId(entry.id); setDraft(toDraft(entry)); setOpen(true); }} onDelete={() => { updateSpeed((current) => ({ ...current, manualFaqs: current.manualFaqs.filter((currentEntry) => currentEntry.id !== entry.id) })); onAnnounce("FAQ entry deleted."); }} />) : <AutomationEmptyState title="No FAQ entries yet" description="Add common questions to help visitors find answers before reaching your team." icon={<span className="text-lg font-semibold">?</span>} action={<Button type="button" size="md" onClick={openForCreate} disabled={!growthUnlocked}>Add your first FAQ</Button>} />}
              <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60" onClick={openForCreate} disabled={!growthUnlocked}><PlusIcon className="h-4 w-4" />Add FAQ entry</button>
              {faqEntries.length ? <p className="text-sm text-slate-500">{faqEntries.length} FAQ {faqEntries.length === 1 ? "entry" : "entries"}</p> : null}
            </div>
            <div className="border-t border-slate-200 px-6 py-5">
              <AutomationSectionLabel label="Fallback message" />
              <p className="mb-3 text-sm text-slate-500">Shown when no FAQs match or the visitor clicks "none of these help".</p>
              <Textarea rows={3} maxLength={150} value={automation.speed.faqFallbackMessage} onChange={(event) => {
                const faqFallbackMessage = event.currentTarget.value;
                updateSpeed((current) => ({ ...current, faqFallbackMessage }));
              }} />
              <p className="mt-2 text-right text-xs text-slate-400">{fallbackCount}/150</p>
            </div>
            <AutomationFaqPreview source="manual" helpCenterUrl="" manualFaqs={faqEntries} fallbackMessage={automation.speed.faqFallbackMessage} context={context} />
          </>
        )}
      </div>
      {open ? <DashboardFaqEntryModal title={editingId ? "Edit FAQ entry" : "Add FAQ entry"} draft={draft} saving={false} onChange={setDraft} onClose={closeModal} onSave={saveFaqEntry} /> : null}
    </AutomationSectionCard>
  );
}
