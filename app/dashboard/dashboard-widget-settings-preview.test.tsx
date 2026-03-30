import { renderToStaticMarkup } from "react-dom/server";
import { createSite } from "./use-dashboard-actions.test-helpers";
import { PreviewAvatar, WidgetPreviewFrame } from "./dashboard-widget-settings-preview";

describe("dashboard widget settings preview", () => {
  it("renders icon, photo, fallback photo, and initials avatars", () => {
    expect(renderToStaticMarkup(<PreviewAvatar site={createSite({ avatarStyle: "icon" })} />)).toContain("text-blue-700");
    expect(
      renderToStaticMarkup(<PreviewAvatar site={createSite({ avatarStyle: "photos", teamPhotoUrl: "https://cdn.example/photo.png" })} />)
    ).toContain("https://cdn.example/photo.png");
    expect(renderToStaticMarkup(<PreviewAvatar site={createSite({ avatarStyle: "photos", teamPhotoUrl: null })} compact />)).toContain("bg-gradient-to-br");
    expect(renderToStaticMarkup(<PreviewAvatar site={createSite({ avatarStyle: "initials", widgetTitle: "Chatting Support" })} />)).toContain("CS");
  });

  it("renders desktop and mobile preview frames with status, truncation, and launcher placement", () => {
    const desktop = renderToStaticMarkup(
      <WidgetPreviewFrame
        site={createSite({
          launcherPosition: "left",
          greetingText: "x".repeat(200),
          responseTimeMode: "hours"
        })}
        device="desktop"
      />
    );
    const mobile = renderToStaticMarkup(
      <WidgetPreviewFrame
        site={createSite({
          launcherPosition: "right",
          showOnlineStatus: false,
          greetingText: "Short hello"
        })}
        device="mobile"
      />
    );

    expect(desktop).toContain("Online • Typically replies in a few hours");
    expect(desktop).toContain("left-6");
    expect(desktop).toContain('width:360px');
    expect(desktop).toContain("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    expect(mobile).not.toContain("Online •");
    expect(mobile).toContain("rounded-[32px]");
    expect(mobile).toContain('width:240px');
  });
});
