import { renderToStaticMarkup } from "react-dom/server";
import type { ConversationThread } from "@/lib/types";
import { createConversationThread } from "./use-dashboard-actions.test-helpers";
import {
  browserLabel,
  formatDayLabel,
  groupedMessages,
  locationLabel,
  messageTime,
  referrerLabel,
  renderAttachments,
  replyPlaceholder,
  tagToneClass
} from "./dashboard-thread-detail.utils";

function createConversation(overrides: Partial<ConversationThread> = {}) {
  return createConversationThread({
    email: null,
    city: "London",
    region: "England",
    country: "UK",
    ...overrides
  });
}

describe("dashboard thread detail utils", () => {
  it("formats location, browser, referrer, and reply copy", () => {
    expect(locationLabel(createConversation())).toBe("London, England, UK");
    expect(browserLabel("Mozilla/5.0 (Mac OS X) Chrome/123.0")).toBe("Chrome on macOS");
    expect(browserLabel("Mozilla/5.0 Firefox/124.0")).toBe("Firefox on OS");
    expect(browserLabel(null)).toBe("Unknown");
    expect(referrerLabel("https://www.google.com/search?q=chat")).toBe("google.com");
    expect(referrerLabel("not a url")).toBe("not a url");
    expect(referrerLabel(null)).toBe("Direct");
    expect(replyPlaceholder(createConversation())).toContain("visitor can still see this");
    expect(replyPlaceholder(createConversation({ email: "alex@example.com" }))).toBe("Type a reply...");
  });

  it("groups timeline messages by day and formats timestamps", () => {
    const messages = createConversation({
      messages: [
        {
          id: "msg_1",
          conversationId: "conv_1",
          sender: "user",
          content: "Hi",
          createdAt: "2026-03-28T10:00:00.000Z",
          attachments: []
        },
        {
          id: "msg_2",
          conversationId: "conv_1",
          sender: "founder",
          content: "Hello",
          createdAt: "2026-03-29T11:15:00.000Z",
          attachments: []
        }
      ]
    }).messages;

    expect(groupedMessages(messages)).toEqual([
      { type: "day", value: formatDayLabel("2026-03-28T10:00:00.000Z") },
      { type: "message", value: messages[0] },
      { type: "day", value: formatDayLabel("2026-03-29T11:15:00.000Z") },
      { type: "message", value: messages[1] }
    ]);
    expect(formatDayLabel(new Date().toISOString())).toBe("Today");
    expect(messageTime("2026-03-29T11:15:00.000Z")).toContain(":");
    expect(tagToneClass("pricing")).toMatch(/^bg-/);
  });

  it("renders image and file attachments with the correct styles", () => {
    const founderHtml = renderToStaticMarkup(
      renderAttachments({
        id: "msg_1",
        conversationId: "conv_1",
        sender: "founder",
        content: "",
        createdAt: "2026-03-29T11:15:00.000Z",
        attachments: [
          {
            id: "att_1",
            fileName: "Screenshot.png",
            contentType: "image/png",
            sizeBytes: 4096,
            url: "https://cdn.example/screenshot.png",
            isImage: true
          },
          {
            id: "att_2",
            fileName: "Transcript.pdf",
            contentType: "application/pdf",
            sizeBytes: 2048,
            url: "https://cdn.example/transcript.pdf",
            isImage: false
          }
        ]
      }) ?? <div />
    );

    expect(founderHtml).toContain("Screenshot.png");
    expect(founderHtml).toContain("Transcript.pdf");
    expect(founderHtml).toContain("border-white/20");
    expect(renderAttachments({
      id: "msg_2",
      conversationId: "conv_1",
      sender: "user",
      content: "Hello",
      createdAt: "2026-03-29T11:15:00.000Z",
      attachments: []
    })).toBeNull();
  });
});
