import {
  authForm,
  forgotPasswordAction,
  passwordResetMocks,
  resendVerificationAction,
  resetActionMocks,
  resetPasswordAction,
  verificationMocks
} from "./actions.test-helpers";

describe("password and verification actions", () => {
  beforeEach(() => {
    resetActionMocks();
  });

  it("returns a generic success message for password reset requests", async () => {
    const result = await forgotPasswordAction(authForm({ email: "hello@chatly.example" }));

    expect(passwordResetMocks.requestPasswordReset).toHaveBeenCalledWith("hello@chatly.example");
    expect(result).toEqual({
      ok: true,
      error: null,
      message: "We sent a password reset link to hello@chatly.example."
    });
  });

  it("resends verification links with a generic success message", async () => {
    const result = await resendVerificationAction(authForm({ email: "hello@chatly.example" }));

    expect(verificationMocks.requestEmailVerification).toHaveBeenCalledWith("hello@chatly.example");
    expect(result).toEqual({
      ok: true,
      error: null,
      message: "If that address belongs to an account that still needs verification, we sent a new link."
    });
  });

  it("validates reset links and updates the password", async () => {
    const result = await resetPasswordAction(
      authForm({ token: "reset-token", password: "password123", confirmPassword: "password123" })
    );

    expect(passwordResetMocks.resetPasswordWithToken).toHaveBeenCalledWith("reset-token", "password123");
    expect(result).toEqual({
      ok: true,
      error: null,
      message: "Your password has been reset. You can sign in with the new one now."
    });
  });

  it("maps invalid reset links into a readable error", async () => {
    passwordResetMocks.resetPasswordWithToken.mockRejectedValueOnce(new Error("INVALID_RESET_TOKEN"));

    const result = await resetPasswordAction(
      authForm({ token: "expired-token", password: "password123", confirmPassword: "password123" })
    );

    expect(result).toEqual({
      ok: false,
      error: "That reset link is invalid or has expired.",
      message: null
    });
  });
});
