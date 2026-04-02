import {
  authForm,
  authMocks,
  dataMocks,
  emailMocks,
  INITIAL_STATE,
  resetActionMocks,
  signupAction,
  timeZoneMocks,
  verificationMocks
} from "./actions.test-helpers";

describe("signup actions", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
    resetActionMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("maps setup failures into readable signup errors", async () => {
    authMocks.signUpUser.mockRejectedValueOnce(new Error("EMAIL_TAKEN"));
    await expect(
      signupAction(INITIAL_STATE, authForm({ email: "hello@chatly.example", password: "password123", websiteUrl: "https://chatly.example" }))
    ).resolves.toMatchObject({ error: "That email already has an account." });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    authMocks.signUpUser.mockRejectedValueOnce(new Error("MISSING_DOMAIN"));
    await expect(
      signupAction(INITIAL_STATE, authForm({ email: "hello@chatly.example", password: "password123" }))
    ).resolves.toMatchObject({ error: "Website URL is required." });
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    authMocks.signUpUser.mockRejectedValueOnce(new Error("INVALID_REFERRAL_CODE"));
    await expect(
      signupAction(
        INITIAL_STATE,
        authForm({
          email: "hello@chatly.example",
          password: "password123",
          websiteUrl: "https://chatly.example",
          referralCode: "BAD-CODE"
        })
      )
    ).resolves.toMatchObject({ error: "That referral code wasn't recognized." });
  });

  it("still logs unexpected signup failures", async () => {
    authMocks.signUpUser.mockRejectedValueOnce(new Error("boom"));

    const result = await signupAction(
      INITIAL_STATE,
      authForm({ email: "hello@chatly.example", password: "password123", websiteUrl: "https://chatly.example" })
    );

    expect(result.error).toBe("We couldn't create your account right now. Please try again in a moment.");
  });

  it("keeps owner signup on the page instead of starting an app session", async () => {
    authMocks.signUpUser.mockResolvedValueOnce({ id: "user_signup", email: "new@chatly.example" });

    const result = await signupAction(
      INITIAL_STATE,
      authForm({
        email: "new@chatly.example",
        password: "password123",
        websiteUrl: "https://chatly.example",
        referralCode: "AFF-ABC123",
        timezone: "Europe/London"
      })
    );

    expect(result).toEqual({
      ok: true,
      error: null,
      nextPath: null,
      fields: {
        email: "new@chatly.example",
        password: "password123",
        websiteUrl: "https://chatly.example",
        referralCode: "AFF-ABC123"
      }
    });
    expect(authMocks.signUpUser).toHaveBeenCalledWith({
      email: "new@chatly.example",
      password: "password123",
      websiteUrl: "https://chatly.example",
      referralCode: "AFF-ABC123"
    });
    expect(authMocks.setUserSession).not.toHaveBeenCalled();
    expect(timeZoneMocks.persistPreferredTimeZoneForUser).toHaveBeenCalledWith(
      "user_signup",
      "Europe/London"
    );
    expect(dataMocks.getPostAuthPath).not.toHaveBeenCalled();
    expect(verificationMocks.requestEmailVerificationForUserId).toHaveBeenCalledWith("user_signup");
    expect(emailMocks.sendAccountWelcomeEmail).toHaveBeenCalledWith({
      to: "new@chatly.example",
      firstName: "new",
      dashboardUrl: "https://chatly.example/dashboard"
    });
  });

  it("creates invited teammate accounts without onboarding a new workspace", async () => {
    authMocks.signUpInvitedUser.mockResolvedValueOnce({
      id: "user_member",
      email: "teammate@chatly.example",
      workspaceOwnerId: "owner_123"
    });

    const result = await signupAction(
      INITIAL_STATE,
      authForm({ email: "teammate@chatly.example", password: "password123", inviteId: "invite_123" })
    );

    expect(result).toEqual({
      ok: true,
      error: null,
      nextPath: "/dashboard",
      fields: {
        email: "teammate@chatly.example",
        password: "password123",
        websiteUrl: "",
        referralCode: ""
      }
    });
    expect(authMocks.signUpInvitedUser).toHaveBeenCalledWith({
      inviteId: "invite_123",
      email: "teammate@chatly.example",
      password: "password123"
    });
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_member", "owner_123");
    expect(verificationMocks.requestEmailVerificationForUserId).not.toHaveBeenCalled();
    expect(emailMocks.sendAccountWelcomeEmail).not.toHaveBeenCalled();
  });
});
