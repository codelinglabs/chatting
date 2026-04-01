const authMocks = vi.hoisted(() => ({
  resumeOwnerOnboardingForUser: vi.fn(),
  setUserSession: vi.fn(),
  signInUser: vi.fn(),
  signUpInvitedUser: vi.fn(),
  signUpUser: vi.fn()
}));

const emailMocks = vi.hoisted(() => ({ sendAccountWelcomeEmail: vi.fn() }));
const verificationMocks = vi.hoisted(() => ({ requestEmailVerificationForUserId: vi.fn() }));
const dataMocks = vi.hoisted(() => ({
  getPostAuthPath: vi.fn(),
  onboardingPathForStep: vi.fn((step: string) => (step === "done" ? "/dashboard" : `/onboarding?step=${step}`))
}));
const workspaceMocks = vi.hoisted(() => ({ acceptTeamInvite: vi.fn() }));

vi.mock("@/lib/auth", () => authMocks);
vi.mock("@/lib/auth-email-verification", () => verificationMocks);
vi.mock("@/lib/chatly-transactional-email-senders", () => emailMocks);
vi.mock("@/lib/data", () => dataMocks);
vi.mock("@/lib/workspace-access", () => workspaceMocks);

import { loginAction, signupAction, type AuthActionState } from "./actions";

const INITIAL_STATE: AuthActionState = {
  ok: false,
  error: null,
  nextPath: null,
  fields: { email: "", password: "", websiteUrl: "", referralCode: "" }
};

function authForm(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("login actions edge cases", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
    dataMocks.getPostAuthPath.mockResolvedValue("/onboarding?step=customize");
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("maps the remaining login auth error variants", async () => {
    authMocks.signInUser.mockRejectedValueOnce(new Error("INVITE_NOT_FOUND"));
    expect(await loginAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123" }))).toMatchObject({
      error: "That team invite is no longer available."
    });

    authMocks.signInUser.mockRejectedValueOnce(new Error("INVITE_ALREADY_ACCEPTED"));
    expect(await loginAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123" }))).toMatchObject({
      error: "That team invite has already been accepted."
    });

    authMocks.signInUser.mockRejectedValueOnce(new Error("password authentication failed"));
    expect(await loginAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123" }))).toMatchObject({
      error: "We couldn't sign you in right now. Please try again in a moment."
    });
  });

  it("maps production signup setup errors and keeps signup successful when follow-up emails fail", async () => {
    process.env.NODE_ENV = "production";

    authMocks.signUpUser.mockRejectedValueOnce(new Error("AUTH_SECRET missing"));
    expect(
      await signupAction(
        INITIAL_STATE,
        authForm({ email: "a@b.com", password: "password123", websiteUrl: "https://example.com" })
      )
    ).toMatchObject({
      error: "We couldn't create your account right now. Please try again in a moment."
    });

    authMocks.signUpUser.mockResolvedValueOnce({ id: "user_1", email: "alex@example.com" });
    dataMocks.getPostAuthPath.mockResolvedValueOnce("/onboarding?step=customize");
    verificationMocks.requestEmailVerificationForUserId.mockRejectedValueOnce(new Error("mail down"));
    emailMocks.sendAccountWelcomeEmail.mockRejectedValueOnce(new Error("smtp down"));

    await expect(
      signupAction(
        INITIAL_STATE,
        authForm({ email: "alex@example.com", password: "password123", websiteUrl: "https://example.com" })
      )
    ).resolves.toMatchObject({
      ok: true,
      nextPath: "/onboarding?step=customize"
    });
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_1");
    expect(verificationMocks.requestEmailVerificationForUserId).toHaveBeenCalledWith("user_1");
  });
});
