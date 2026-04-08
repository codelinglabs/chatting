import { isHighIntentPage, previewIncomingMessage } from "@/lib/notification-utils";

describe("notification utils", () => {
  it("detects high-intent pages from urls and raw paths", () => {
    expect(isHighIntentPage("https://chatting.example/pricing")).toBe(true);
    expect(isHighIntentPage("/enterprise/demo")).toBe(true);
    expect(isHighIntentPage("/blog/welcome")).toBe(false);
    expect(isHighIntentPage(null)).toBe(false);
  });

  it("builds readable incoming message previews", () => {
    expect(previewIncomingMessage("  Hello there  ", 0)).toBe("Hello there");
    expect(previewIncomingMessage("   ", 0)).toBe("A visitor sent a new message.");
    expect(previewIncomingMessage("   ", 1)).toBe("Shared an attachment");
    expect(previewIncomingMessage("   ", 3)).toBe("Shared 3 attachments");
  });
});
