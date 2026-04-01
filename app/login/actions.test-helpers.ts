const authMocks = vi.hoisted(() => ({
  resumeOwnerOnboardingForUser: vi.fn(),
  setUserSession: vi.fn(),
  signInUser: vi.fn(),
  signUpInvitedUser: vi.fn(),
  signUpUser: vi.fn()
}));

const emailMocks = vi.hoisted(() => ({
  sendAccountWelcomeEmail: vi.fn()
}));

const passwordResetMocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  resetPasswordWithToken: vi.fn()
}));

const dataMocks = vi.hoisted(() => ({
  getPostAuthPath: vi.fn(),
  onboardingPathForStep: vi.fn((step: string) => (step === "done" ? "/dashboard" : `/onboarding?step=${step}`))
}));

const workspaceMocks = vi.hoisted(() => ({
  acceptTeamInvite: vi.fn()
}));

vi.mock("@/lib/auth", () => authMocks);
vi.mock("@/lib/auth-password-reset", () => passwordResetMocks);
vi.mock("@/lib/chatly-transactional-email-senders", () => emailMocks);
vi.mock("@/lib/data", () => dataMocks);
vi.mock("@/lib/workspace-access", () => workspaceMocks);

import { loginAction, signupAction, type AuthActionState } from "./actions";
import { forgotPasswordAction, resetPasswordAction } from "./password-actions";

const callLoginAction: typeof loginAction = (...args) => loginAction(...args);
const callSignupAction: typeof signupAction = (...args) => signupAction(...args);
const callForgotPasswordAction: typeof forgotPasswordAction = (...args) => forgotPasswordAction(...args);
const callResetPasswordAction: typeof resetPasswordAction = (...args) => resetPasswordAction(...args);

export {
  authMocks,
  dataMocks,
  emailMocks,
  callForgotPasswordAction as forgotPasswordAction,
  callLoginAction as loginAction,
  passwordResetMocks,
  callResetPasswordAction as resetPasswordAction,
  callSignupAction as signupAction,
  workspaceMocks,
  type AuthActionState
};

export const INITIAL_STATE: AuthActionState = {
  ok: false,
  error: null,
  nextPath: null,
  fields: {
    email: "",
    password: "",
    websiteUrl: "",
    referralCode: ""
  }
};

export function authForm(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  return form;
}

export function resetActionMocks() {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
  dataMocks.getPostAuthPath.mockResolvedValue("/onboarding?step=customize");
}
