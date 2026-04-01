import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./dashboard/test-react-hooks";

async function loadGrometricsScript(hostname: string) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const script = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/script", () => ({
    default: (props: Record<string, unknown>) => ((script(props), <script data-testid="grometrics" />))
  }));
  vi.stubGlobal("window", { location: { hostname } });

  const module = await import("./grometrics-script");
  return { GrometricsScript: module.default, reactMocks, script };
}

describe("grometrics script", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the analytics script for non-local hosts", async () => {
    const { GrometricsScript, reactMocks, script } = await loadGrometricsScript("usechatting.com");

    reactMocks.beginRender();
    renderToStaticMarkup(<GrometricsScript />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const html = renderToStaticMarkup(<GrometricsScript />);

    expect(html).toContain("grometrics");
    expect(script).toHaveBeenCalledWith(expect.objectContaining({
      "data-domain": "usechatting.com",
      "data-website-id": "gm_13c7a11993d9d7ce797e06a3",
      id: "grometrics-script"
    }));
  });

  it("skips the analytics script on localhost", async () => {
    const { GrometricsScript, reactMocks, script } = await loadGrometricsScript("localhost");

    reactMocks.beginRender();
    const firstHtml = renderToStaticMarkup(<GrometricsScript />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const secondHtml = renderToStaticMarkup(<GrometricsScript />);

    expect(firstHtml).not.toContain("grometrics");
    expect(secondHtml).not.toContain("grometrics");
    expect(script).not.toHaveBeenCalled();
  });
});
