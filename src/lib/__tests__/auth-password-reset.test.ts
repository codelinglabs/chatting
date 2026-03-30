const mocks = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(),
  findAuthUserByEmail: vi.fn(),
  updateAuthUserPassword: vi.fn(),
  consumeAuthEmailToken: vi.fn(),
  findActiveAuthEmailToken: vi.fn(),
  insertAuthEmailToken: vi.fn(),
  invalidateAuthEmailTokens: vi.fn()
}));

vi.mock("@/lib/chatly-transactional-email-senders", () => ({
  sendPasswordResetEmail: mocks.sendPasswordResetEmail
}));

vi.mock("@/lib/repositories/auth-repository", () => ({
  findAuthUserByEmail: mocks.findAuthUserByEmail,
  updateAuthUserPassword: mocks.updateAuthUserPassword
}));

vi.mock("@/lib/repositories/auth-token-repository", () => ({
  consumeAuthEmailToken: mocks.consumeAuthEmailToken,
  findActiveAuthEmailToken: mocks.findActiveAuthEmailToken,
  insertAuthEmailToken: mocks.insertAuthEmailToken,
  invalidateAuthEmailTokens: mocks.invalidateAuthEmailTokens
}));

import { requestPasswordReset, resetPasswordWithToken } from "@/lib/auth-password-reset";

describe("auth password reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-secret";
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
  });

  it("creates and emails a password reset token for known users", async () => {
    mocks.findAuthUserByEmail.mockResolvedValueOnce({
      id: "user_1",
      email: "hello@chatly.example"
    });

    await requestPasswordReset("hello@chatly.example");

    expect(mocks.invalidateAuthEmailTokens).toHaveBeenCalledWith("user_1", "password_reset");
    expect(mocks.insertAuthEmailToken).toHaveBeenCalledTimes(1);
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: "hello@chatly.example",
      resetUrl: expect.stringContaining("https://chatly.example/login?mode=reset&token=")
    });
  });

  it("silently skips unknown emails", async () => {
    mocks.findAuthUserByEmail.mockResolvedValueOnce(null);

    await expect(requestPasswordReset("missing@chatly.example")).resolves.toBe(false);
    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("updates the password when a valid token is consumed", async () => {
    mocks.findActiveAuthEmailToken.mockResolvedValueOnce({
      id: "token_1",
      user_id: "user_1"
    });

    await resetPasswordWithToken("token-value", "password123");

    expect(mocks.updateAuthUserPassword).toHaveBeenCalledWith(
      "user_1",
      expect.stringMatching(/^scrypt:/)
    );
    expect(mocks.consumeAuthEmailToken).toHaveBeenCalledWith("token_1");
  });

  it("rejects invalid reset tokens", async () => {
    mocks.findActiveAuthEmailToken.mockResolvedValueOnce(null);

    await expect(resetPasswordWithToken("expired", "password123")).rejects.toThrow("INVALID_RESET_TOKEN");
  });
});
