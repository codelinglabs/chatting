import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSite } from "./use-dashboard-actions.test-helpers";
import { WidgetAppearancePanel } from "./dashboard-widget-settings-appearance-panel";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

describe("widget appearance panel", () => {
  it("updates branding, position, avatar choices, and team photo actions", () => {
    const onUpdateActiveSite = vi.fn();
    const onUploadTeamPhoto = vi.fn();
    const onRemoveTeamPhoto = vi.fn();
    const site = createSite({ avatarStyle: "photos", teamPhotoUrl: "https://cdn.example/team.png" });
    const tree = WidgetAppearancePanel({
      activeSite: site,
      photoActionState: "idle",
      photoError: "Use a PNG, JPG, GIF, or WebP image.",
      onUpdateActiveSite,
      onUploadTeamPhoto,
      onRemoveTeamPhoto
    });
    const inputs = collectElements(tree, (element) => element.type === "input");
    const textareas = collectElements(tree, (element) => element.type === "textarea");
    const buttons = collectElements(tree, (element) => element.type === "button");
    const fileInput = inputs.find((element) => element.props.type === "file");
    const fakeFile = { name: "team.png", type: "image/png", size: 12 } as File;

    inputs.find((element) => element.props.placeholder === "https://example.com")?.props.onChange({ target: { value: "https://usechatting.com" } });
    inputs.find((element) => element.props.value === site.brandColor)?.props.onChange({ target: { value: "#ff0000" } });
    buttons.find((element) => element.props["aria-label"] === "Use #7C3AED as the brand color")?.props.onClick();
    inputs.find((element) => element.props.placeholder === "e.g., Acme Support")?.props.onChange({ target: { value: "Chatting Team" } });
    textareas[0]?.props.onChange({ target: { value: "Hello there" } });
    buttons.find((element) => textContent(element.props.children).includes("Bottom left"))?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Icon"))?.props.onClick();
    fileInput?.props.onChange({ target: { files: [fakeFile], value: "picked" } });
    buttons.find((element) => textContent(element.props.children).includes("Remove photo"))?.props.onClick();

    expect(onUpdateActiveSite.mock.calls.map(([updater]) => updater(site))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ domain: "https://usechatting.com" }),
        expect.objectContaining({ brandColor: "#FF0000" }),
        expect.objectContaining({ brandColor: "#7C3AED" }),
        expect.objectContaining({ widgetTitle: "Chatting Team" }),
        expect.objectContaining({ greetingText: "Hello there" }),
        expect.objectContaining({ launcherPosition: "left" }),
        expect.objectContaining({ avatarStyle: "icon" })
      ])
    );
    expect(onUploadTeamPhoto).toHaveBeenCalledWith(fakeFile);
    expect(onRemoveTeamPhoto).toHaveBeenCalled();
    expect(renderToStaticMarkup(tree)).toContain("Use a PNG, JPG, GIF, or WebP image.");
  });
});
