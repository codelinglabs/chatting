import { renderToStaticMarkup } from "react-dom/server";

type AuthMode = "signin" | "forgot" | "reset" | "success";

async function renderAuthForms(mode: AuthMode = "signin") {
  vi.resetModules();

  vi.doMock("next/navigation", () => ({
    useRouter: () => ({
      replace: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn()
    })
  }));

  vi.doMock("react-dom", async () => {
    const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
    return {
      ...actual,
      useFormStatus: () => ({ pending: false })
    };
  });

  vi.doMock("./actions", () => ({
    loginAction: vi.fn(),
    signupAction: vi.fn()
  }));

  vi.doMock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    let useStateCalls = 0;

    return {
      ...actual,
      useEffect: vi.fn(),
      useActionState: vi.fn((_: unknown, initialState: unknown) => [initialState, vi.fn()]),
      useState: vi.fn((initialValue: unknown) => {
        useStateCalls += 1;
        if (useStateCalls === 1) {
          return [mode, vi.fn()];
        }

        if (useStateCalls === 3 && mode === "success") {
          return [
            {
              title: "Reset email sent",
              body: "We sent a password reset link to hello@chatly.example."
            },
            vi.fn()
          ];
        }

        return [initialValue, vi.fn()];
      })
    };
  });

  const module = await import("./auth-forms");
  return renderToStaticMarkup(<module.AuthForms />);
}

describe("auth forms", () => {
  it("renders the default sign-in state", async () => {
    const html = await renderAuthForms("signin");

    expect(html).toContain("Welcome back to Chatting");
    expect(html).toContain("Sign in");
    expect(html).toContain("Create one");
    expect(html).toContain("Forgot password?");
    expect(html).toContain("Remember me");
    expect(html).toContain("2,400+");
    expect(html).toContain("1.2m");
  });

  it("renders the forgot-password state", async () => {
    const html = await renderAuthForms("forgot");

    expect(html).toContain("Forgot password");
    expect(html).toContain("Back to sign in");
    expect(html).toContain("Send reset link");
  });

  it("renders the reset-password state", async () => {
    const html = await renderAuthForms("reset");

    expect(html).toContain("Reset password");
    expect(html).toContain("Confirm password");
    expect(html).toContain("Reset password");
  });

  it("renders the success state", async () => {
    const html = await renderAuthForms("success");

    expect(html).toContain("Reset email sent");
    expect(html).toContain("Back to sign in");
    expect(html).toContain("Create account");
  });
});
