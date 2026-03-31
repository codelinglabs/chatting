import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "../dashboard/test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

describe("form controls", () => {
  it("renders shared text inputs, errors, and pending submit buttons", async () => {
    vi.resetModules();
    vi.doMock("react-dom", async () => {
      const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
      return { ...actual, useFormStatus: () => ({ pending: true }) };
    });

    const module = await import("./form-controls");
    const html = renderToStaticMarkup(
      <>
        <module.FormInput placeholder="Email" />
        <module.FormSelect defaultValue="one">
          <option value="one">One</option>
        </module.FormSelect>
        <module.FormTextarea placeholder="Message" />
        <module.FormTextField label="Work email" value="hello@example.com" onChange={() => {}} />
        <module.FormErrorMessage message="Something went wrong." />
        <module.FormSubmitButton idleLabel="Save" pendingLabel="Saving..." />
      </>
    );

    expect(html).toContain("placeholder=\"Email\"");
    expect(html).toContain(">One<");
    expect(html).toContain("Work email");
    expect(html).toContain("Something went wrong.");
    expect(html).toContain("Saving...");
  });

  it("toggles password visibility and forwards field updates", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    vi.doMock("react", () => reactMocks.moduleFactory());
    const module = await import("./form-controls");

    const onChange = vi.fn();
    reactMocks.beginRender();
    let tree = module.FormPasswordField({ label: "Password", value: "secret", onChange, name: "password" });
    collectElements(tree, (element) => element.type === "input")[0]?.props.onChange({ target: { value: "next-secret" } });
    expect(onChange).toHaveBeenCalledWith("next-secret");
    expect(collectElements(tree, (element) => element.type === "input")[0]?.props.type).toBe("password");

    collectElements(tree, (element) => element.type === "button")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = module.FormPasswordField({ label: "Password", value: "secret", onChange, name: "password" });
    expect(collectElements(tree, (element) => element.type === "input")[0]?.props.type).toBe("text");
    expect(collectElements(tree, (element) => element.type === "button")[0]?.props["aria-label"]).toBe("Hide password");
  });
});
