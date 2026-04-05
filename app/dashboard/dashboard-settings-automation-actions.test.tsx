import type { ReactElement, ReactNode } from "react";
import { createDefaultDashboardAutomationSettings } from "@/lib/data/settings-automation";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  if (typeof element.type === "function") {
    return collectElements(element.type(element.props), predicate);
  }
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

describe("dashboard settings automation actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState: (initial: unknown) => [initial, vi.fn()]
      };
    });
    vi.doMock("next/link", () => ({
      default: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children}</a>
    }));
    vi.doMock("../components/ui/Button", () => ({
      Button: "button"
    }));
    vi.doMock("../components/ui/Input", () => ({
      Input: "input"
    }));
    vi.doMock("../components/ui/Textarea", () => ({
      Textarea: "textarea"
    }));
    vi.doMock("./dashboard-settings-automation-ui", () => ({
      AutomationCheckbox: ({ checked, onChange, label }: Record<string, unknown>) => (
        <label>
          <input
            type="checkbox"
            checked={Boolean(checked)}
            onChange={(event) => onChange((event.target as HTMLInputElement).checked)}
          />
          {label}
        </label>
      ),
      AutomationEmptyState: ({ children }: Record<string, unknown>) => <div>{children}</div>,
      AutomationFieldLabel: ({ label }: Record<string, unknown>) => <label>{label}</label>,
      AutomationSectionCard: ({ children }: Record<string, unknown>) => <section>{children}</section>,
      AutomationSelect: ({ children, ...props }: Record<string, unknown>) => <select {...props}>{children}</select>,
      AutomationSelectField: ({ children, ...props }: Record<string, unknown>) => <select {...props}>{children}</select>,
      AutomationUpgradeCard: ({ children }: Record<string, unknown>) => <div>{children}</div>
    }));
  });

  it("captures the away message value before the deferred updater runs", async () => {
    const module = await import("./dashboard-settings-automation-offline-section");
    const onChange = vi.fn();
    const automation = createDefaultDashboardAutomationSettings();

    const tree = module.SettingsAutomationOfflineSection({
      automation,
      context: undefined,
      onChange
    });
    const messageField = collectElements(
      tree,
      (element) => element.type === "textarea" && element.props?.placeholder === "Enter your away message..."
    )[0];
    const event = { currentTarget: { value: "We are away for lunch." } };

    messageField?.props.onChange(event);
    event.currentTarget.value = "mutated after handler";

    const updater = onChange.mock.calls[0]?.[0] as ((current: typeof automation) => typeof automation) | undefined;
    const next = updater?.(automation);

    expect(next?.offline.autoReplyMessage).toBe("We are away for lunch.");
  });

  it("captures proactive checkbox state before the deferred updater runs", async () => {
    const module = await import("./dashboard-settings-automation-proactive-section");
    const onChange = vi.fn();
    const automation = createDefaultDashboardAutomationSettings();
    automation.proactive.pagePrompts = [
      {
        id: "prompt_1",
        pagePath: "/pricing",
        message: "Need help?",
        delaySeconds: 30,
        autoOpenWidget: false
      }
    ];

    const tree = module.SettingsAutomationProactiveSection({
      automation,
      billing: { planKey: "growth", planName: "Growth" } as never,
      onChange,
      onAnnounce: vi.fn()
    });
    const checkbox = collectElements(
      tree,
      (element) =>
        element.type === "input" &&
        element.props?.type === "checkbox" &&
        element.props?.checked === false
    )[0];
    const event = { currentTarget: { checked: true } };

    checkbox?.props.onChange(event);
    event.currentTarget.checked = false;

    const updater = onChange.mock.calls[0]?.[0] as ((current: typeof automation) => typeof automation) | undefined;
    const next = updater?.(automation);

    expect(next?.proactive.pagePrompts[0]?.autoOpenWidget).toBe(true);
  });
});
