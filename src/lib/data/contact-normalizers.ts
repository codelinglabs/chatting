import type { ContactNote, ContactPageHistoryEntry } from "@/lib/contact-types";
import { DEFAULT_TAGS } from "@/lib/data/constants";
import { optionalText } from "@/lib/utils";

export function pagePathFromUrl(value: string | null | undefined) {
  const candidate = optionalText(value);
  if (!candidate) {
    return "/";
  }

  try {
    return new URL(candidate).pathname || "/";
  } catch {
    return candidate;
  }
}

export function parseContactNotes(value: unknown): ContactNote[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const note = entry as Partial<ContactNote>;
      if (!note.id || !note.body || !note.authorUserId || !note.authorName || !note.createdAt || !note.updatedAt) {
        return null;
      }

      return {
        id: note.id,
        body: note.body,
        authorUserId: note.authorUserId,
        authorName: note.authorName,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      } satisfies ContactNote;
    })
    .filter((note): note is ContactNote => Boolean(note))
    .slice(0, 100);
}

export function parsePageHistory(value: unknown): ContactPageHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const page = entry as Partial<ContactPageHistoryEntry>;
      if (!page.page || !page.seenAt) {
        return null;
      }

      return {
        page: page.page,
        seenAt: page.seenAt,
        durationSeconds: Number(page.durationSeconds ?? 0)
      } satisfies ContactPageHistoryEntry;
    })
    .filter((entry): entry is ContactPageHistoryEntry => Boolean(entry))
    .slice(0, 100);
}

export function mergeDistinctValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function buildContactTagOptions(tags: string[]) {
  return mergeDistinctValues([...DEFAULT_TAGS, ...tags]);
}

export function mergePageHistory(
  current: ContactPageHistoryEntry[],
  input: { pageUrl?: string | null; seenAt: string; durationSeconds?: number | null }
) {
  const page = pagePathFromUrl(input.pageUrl);
  if (!input.pageUrl) {
    return { pageHistory: current, incrementPageViews: false };
  }

  if (current[0]?.page === page) {
    return {
      pageHistory: [
        {
          ...current[0],
          seenAt: input.seenAt,
          durationSeconds: Math.max(current[0].durationSeconds, Number(input.durationSeconds ?? current[0].durationSeconds))
        },
        ...current.slice(1)
      ],
      incrementPageViews: false
    };
  }

  return {
    pageHistory: [
      { page, seenAt: input.seenAt, durationSeconds: Math.max(0, Number(input.durationSeconds ?? 0)) },
      ...current
    ].slice(0, 100),
    incrementPageViews: true
  };
}

export function updateSource(current: Record<string, string | null>, pageUrl?: string | null, referrer?: string | null) {
  const resolvedPage = pagePathFromUrl(pageUrl);
  const url = optionalText(pageUrl);
  const searchParams = url ? new URL(url, "https://chatting.invalid").searchParams : null;

  return {
    firstLandingPage: current.firstLandingPage ?? (pageUrl ? resolvedPage : null),
    referrer: current.referrer ?? optionalText(referrer) ?? null,
    utmSource: current.utmSource ?? optionalText(searchParams?.get("utm_source")) ?? null,
    utmMedium: current.utmMedium ?? optionalText(searchParams?.get("utm_medium")) ?? null,
    utmCampaign: current.utmCampaign ?? optionalText(searchParams?.get("utm_campaign")) ?? null
  };
}
