import { afterEach, describe, expect, it, vi } from "vitest";
import {
  conversationHref,
  conversationIdentity,
  conversationPageUrl,
  conversationRowDetails
} from "./dashboard-conversation-display";

describe("dashboard conversation display", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds visitor identity from email and fallback secondary labels", () => {
    expect(conversationIdentity("alex.stone@example.com", "Anonymous visitor")).toEqual({
      name: "Alex Stone",
      initials: "AS",
      secondary: "alex.stone@example.com"
    });

    expect(conversationIdentity(null, "Anonymous visitor")).toEqual({
      name: "Visitor",
      initials: "V",
      secondary: "Anonymous visitor"
    });
  });

  it("builds shared row details for dashboard conversation cards", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T10:10:00.000Z"));

    expect(
      conversationRowDetails(
        {
          id: "conv_1",
          email: null,
          lastMessageAt: "2026-03-29T10:05:00.000Z",
          updatedAt: "2026-03-29T10:00:00.000Z",
          lastMessagePreview: null
        },
        {
          secondaryFallback: "Main site",
          previewFallback: "No messages yet"
        }
      )
    ).toEqual({
      name: "Visitor",
      initials: "V",
      secondary: "Main site",
      href: "/dashboard/inbox?id=conv_1",
      preview: "No messages yet",
      timestamp: "5 minutes ago"
    });

    expect(conversationHref("conv_2")).toBe("/dashboard/inbox?id=conv_2");
    expect(
      conversationPageUrl({
        pageUrl: "https://usechatting.com/outreach/add",
        recordedPageUrl: "https://usechatting.com/campaigns/80dfca69-4637-42e0-9171-b6ec33868ab8"
      })
    ).toBe("https://usechatting.com/campaigns/80dfca69-4637-42e0-9171-b6ec33868ab8");
    expect(conversationPageUrl({ pageUrl: "https://usechatting.com/", recordedPageUrl: null })).toBe("https://usechatting.com/");
    expect(conversationPageUrl({ pageUrl: null, recordedPageUrl: null })).toBe("/");
  });
});
