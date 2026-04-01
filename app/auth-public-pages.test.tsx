import { renderToStaticMarkup } from "react-dom/server";

describe("auth and public page wrappers", () => {
  it("passes reset and invite params into the login page form", async () => {
    vi.resetModules();
    const captures: Record<string, unknown> = {};
    vi.doMock("./login/auth-forms", () => ({
      AuthForms: (props: unknown) => ((captures.login = props), <div>login</div>)
    }));
    const module = await import("./login/page");
    renderToStaticMarkup(
      await module.default({
        searchParams: Promise.resolve({
          mode: "reset",
          token: "token_123",
          invite: "invite_123",
          email: "teammate@example.com",
          redirectTo: "/dashboard/inbox?id=conv_1"
        })
      })
    );

    expect(captures.login).toMatchObject({
      initialMode: "reset",
      resetToken: "token_123",
      inviteId: "invite_123",
      inviteEmail: "teammate@example.com",
      redirectTo: "/dashboard/inbox?id=conv_1"
    });
  });

  it("passes verify mode into the login page form", async () => {
    vi.resetModules();
    const captures: Record<string, unknown> = {};
    vi.doMock("./login/auth-forms", () => ({
      AuthForms: (props: unknown) => ((captures.login = props), <div>login</div>)
    }));
    const module = await import("./login/page");
    renderToStaticMarkup(
      await module.default({
        searchParams: Promise.resolve({
          mode: "verify"
        })
      })
    );

    expect(captures.login).toMatchObject({
      initialMode: "verify"
    });
  });

  it("redirects signed-in signup visitors and renders the signup form for guests", async () => {
    vi.resetModules();
    const redirect = vi.fn();
    vi.doMock("next/navigation", () => ({ redirect }));
    vi.doMock("@/lib/auth", () => ({ getCurrentUser: vi.fn().mockResolvedValueOnce({ id: "user_1" }).mockResolvedValueOnce(null) }));
    vi.doMock("@/lib/data", () => ({ getUserOnboardingStep: vi.fn().mockResolvedValue("customize") }));
    vi.doMock("./signup/signup-form", () => ({ SignupForm: () => <div>signup-form</div> }));
    const module = await import("./signup/page");

    await module.default({ searchParams: Promise.resolve({ invite: "invite_123", email: "teammate@example.com" }) });
    const guestMarkup = renderToStaticMarkup(await module.default({ searchParams: Promise.resolve({}) }));

    expect(redirect).toHaveBeenCalledWith("/invite?invite=invite_123&email=teammate%40example.com");
    expect(guestMarkup).toContain("signup-form");
  });

  it("records valid feedback and leaves invalid ratings untouched", async () => {
    vi.resetModules();
    const recordFeedback = vi.fn();
    vi.doMock("@/lib/conversation-feedback", () => ({ parseConversationRating: (value?: string) => (value === "5" ? 5 : null) }));
    vi.doMock("@/lib/data", () => ({ recordFeedback }));
    const module = await import("./feedback/page");

    const validMarkup = renderToStaticMarkup(await module.default({ searchParams: Promise.resolve({ conversationId: "conversation_1", rating: "5" }) }));
    const invalidMarkup = renderToStaticMarkup(await module.default({ searchParams: Promise.resolve({ conversationId: "conversation_1", rating: "bad" }) }));

    expect(recordFeedback).toHaveBeenCalledWith("conversation_1", 5);
    expect(validMarkup).toContain("You rated this conversation 5 out of 5.");
    expect(invalidMarkup).toContain("We couldn&#x27;t read that feedback link.");
  });

  it("renders the public verify page for valid and invalid links", async () => {
    vi.resetModules();
    const verifyEmailWithToken = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("expired"));
    vi.doMock("@/lib/auth-email-verification", () => ({ verifyEmailWithToken }));
    const module = await import("./verify/page");

    const verifiedMarkup = renderToStaticMarkup(
      await module.default({ searchParams: Promise.resolve({ token: "valid-token" }) })
    );
    const expiredMarkup = renderToStaticMarkup(
      await module.default({ searchParams: Promise.resolve({ token: "expired-token" }) })
    );

    expect(verifyEmailWithToken).toHaveBeenNthCalledWith(1, "valid-token");
    expect(verifyEmailWithToken).toHaveBeenNthCalledWith(2, "expired-token");
    expect(verifiedMarkup).toContain("Email verified");
    expect(expiredMarkup).toContain("Verification link expired");
    expect(expiredMarkup).toContain("Resend verification email");
  });
});
