export function getGenericAuthErrorMessage(mode: "login" | "signup") {
  return mode === "signup"
    ? "We couldn't create your account right now. Please try again in a moment."
    : "We couldn't sign you in right now. Please try again in a moment.";
}

export const FORGOT_PASSWORD_ERROR_MESSAGE =
  "We couldn't send the reset link right now. Please try again in a moment.";

export const RESET_PASSWORD_ERROR_MESSAGE =
  "We couldn't reset your password right now. Please try again in a moment.";
