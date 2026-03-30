import { renderToStaticMarkup } from "react-dom/server";
import {
  browserLabel,
  formatDayLabel,
  groupedMessages,
  locationLabel,
  referrerLabel,
  renderAttachments
} from "./dashboard-thread-detail.utils";

describe("dashboard thread detail utils more", () => {
  it("covers remaining browser, location, and referrer labels", () => {
    expect(locationLabel({ city: null, region: null, country: null } as never)).toBeNull();
    expect(browserLabel("Mozilla/5.0 Edg/124 Windows")).toBe("Edge on Windows");
    expect(browserLabel("Mozilla/5.0 Safari iPhone")).toBe("Safari on iOS");
    expect(browserLabel("Mozilla/5.0 Firefox Android")).toBe("Firefox on Android");
    expect(referrerLabel("https://www.linkedin.com/posts")).toBe("linkedin.com");
  });

  it("formats older day labels and keeps groupedMessages empty-safe", () => {
    expect(groupedMessages([])).toEqual([]);
    expect(formatDayLabel("2026-03-01T12:00:00.000Z")).toBe("1 March 2026");
  });

  it("renders user attachments with non-founder styling", () => {
    const html = renderToStaticMarkup(
      renderAttachments({
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "",
        createdAt: "2026-03-29T11:15:00.000Z",
        attachments: [
          {
            id: "att_1",
            fileName: "Transcript.pdf",
            contentType: "application/pdf",
            sizeBytes: 2048,
            url: "https://cdn.example/transcript.pdf",
            isImage: false
          }
        ]
      }) ?? <div />
    );

    expect(html).toContain("border-slate-200");
    expect(html).toContain("Transcript.pdf");
  });
});
