import {
  contactAvatarInitials,
  normalizeContactAvatarUrl,
  shouldShowContactAvatarImage
} from "./dashboard-contact-avatar.utils";

describe("dashboard contact avatar utils", () => {
  it("normalizes avatar urls before rendering", () => {
    expect(normalizeContactAvatarUrl(" https://example.com/avatar.png ")).toBe(
      "https://example.com/avatar.png"
    );
    expect(normalizeContactAvatarUrl("   ")).toBeNull();
    expect(normalizeContactAvatarUrl(null)).toBeNull();
  });

  it("hides the image after a load failure and falls back to initials", () => {
    expect(shouldShowContactAvatarImage("https://example.com/avatar.png", false)).toBe(true);
    expect(shouldShowContactAvatarImage("https://example.com/avatar.png", true)).toBe(false);
    expect(shouldShowContactAvatarImage(null, false)).toBe(false);
    expect(contactAvatarInitials("Tina Martinez")).toBe("TM");
    expect(contactAvatarInitials("Tina")).toBe("T");
  });
});
