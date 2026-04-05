"use client";

import type { ContactDetail } from "@/lib/contact-types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  contactSourceSummary,
  formatAvgSessionLabel
} from "./dashboard-contact-drawer-utils";
import { ContactProfileRow, ContactProfileSection } from "./dashboard-contact-profile-ui";

export function ContactActivityTab({ detail }: { detail: ContactDetail }) {
  return (
    <div className="space-y-5">
      <ContactProfileSection title="Activity">
        <div>
          <ContactProfileRow label="First seen" value={formatDateTime(detail.firstSeenAt)} />
          <ContactProfileRow label="Last seen" value={formatRelativeTime(detail.lastSeenAt)} />
          <ContactProfileRow label="Total visits" value={String(detail.totalVisits)} />
          <ContactProfileRow label="Page views" value={String(detail.totalPageViews)} />
          <ContactProfileRow label="Conversations" value={String(detail.conversationCount)} />
          <ContactProfileRow label="Avg. session" value={formatAvgSessionLabel(detail.avgSessionSeconds)} />
        </div>
      </ContactProfileSection>

      <ContactProfileSection title="Source">
        <div>
          <ContactProfileRow label="Landing page" value={detail.source.firstLandingPage ?? "—"} valueClassName="break-all" />
          <ContactProfileRow label="Referrer" value={detail.source.referrer ?? "—"} valueClassName="break-all" />
          <ContactProfileRow label="Channel" value={contactSourceSummary(detail.source) || "—"} />
          <ContactProfileRow label="UTM source" value={detail.source.utmSource ?? "—"} />
          <ContactProfileRow label="UTM medium" value={detail.source.utmMedium ?? "—"} />
          <ContactProfileRow label="UTM campaign" value={detail.source.utmCampaign ?? "—"} />
        </div>
      </ContactProfileSection>

      <ContactProfileSection title="Page history">
        <div className="space-y-3">
          {detail.pageHistory.length ? detail.pageHistory.map((entry, index) => (
            <div key={`${entry.page}-${entry.seenAt}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-mono text-blue-600">{entry.page}</p>
                <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(entry.seenAt)}</p>
              </div>
              <span className="text-slate-500">{entry.durationSeconds}s</span>
            </div>
          )) : <p className="text-sm text-slate-400">No page history captured yet.</p>}
        </div>
      </ContactProfileSection>
    </div>
  );
}
