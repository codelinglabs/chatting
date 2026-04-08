import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getSiteBaseUrl: vi.fn(),
  toastProvider: vi.fn()
}));

vi.mock("@/lib/site-seo", () => ({
  buildDefaultSocialMetadata: () => ({}),
  getSiteBaseUrl: mocks.getSiteBaseUrl,
  SITE_SEO_DESCRIPTION: "desc",
  SITE_SEO_TITLE: "title"
}));
vi.mock("./ui/toast-provider", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => ((mocks.toastProvider(children), <>{children}</>))
}));
vi.mock("./chatting-script", () => ({ default: () => <div>chatting-script</div> }));
vi.mock("./client-error-reporter", () => ({ ClientErrorReporter: () => <div>client-error-reporter</div> }));
vi.mock("./grometrics-script", () => ({ default: () => <div>grometrics-script</div> }));

describe("root layout", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getSiteBaseUrl.mockReturnValue("https://usechatting.com");
  });

  it("renders the app shell scripts and clarity snippet", async () => {
    const RootLayout = (await import("./layout")).default;

    const html = renderToStaticMarkup(<RootLayout><div>child</div></RootLayout>);

    expect(html).toContain("chatting-script");
    expect(html).toContain("client-error-reporter");
    expect(html).toContain("grometrics-script");
    expect(html).toContain('id="clarity-script"');
    expect(html).toContain("https://www.clarity.ms/tag/");
    expect(html).toContain("w6jk7x5ywu");
    expect(html).toContain("child");
    expect(mocks.toastProvider).toHaveBeenCalledWith(expect.anything());
  });

  it("skips the clarity snippet for localhost-like app urls", async () => {
    mocks.getSiteBaseUrl.mockReturnValue("http://localhost:3983");
    const RootLayout = (await import("./layout")).default;

    const html = renderToStaticMarkup(<RootLayout><div>child</div></RootLayout>);

    expect(html).not.toContain('id="clarity-script"');
    expect(html).not.toContain("https://www.clarity.ms/tag/");
  });
});
