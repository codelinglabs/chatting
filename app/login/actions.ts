"use server";

import { setUserSession, signInUser, signUpUser } from "@/lib/auth";

export type AuthActionState = {
  error: string | null;
  ok: boolean;
  fields: {
    email: string;
    password: string;
    siteName: string;
  };
};

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const fields = {
    email,
    password,
    siteName: ""
  };

  if (!email) {
    return {
      ok: false,
      error: "Work email is required.",
      fields
    };
  }

  if (!password) {
    return {
      ok: false,
      error: "Password is required.",
      fields
    };
  }

  const user = await signInUser(email, password);
  if (!user) {
    return {
      ok: false,
      error: "That email and password combination didn't match.",
      fields
    };
  }

  await setUserSession(user.id);

  return {
    ok: true,
    error: null,
    fields
  };
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const siteName = String(formData.get("siteName") ?? "").trim();

  const fields = {
    email,
    password,
    siteName
  };

  try {
    const user = await signUpUser({
      email,
      password,
      siteName
    });

    await setUserSession(user.id);

    return {
      ok: true,
      error: null,
      fields
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "MISSING_EMAIL";

    return {
      ok: false,
      error:
        message === "EMAIL_TAKEN"
          ? "That email already has an account."
          : message === "WEAK_PASSWORD"
            ? "Use at least 8 characters for the password."
            : message === "MISSING_PASSWORD"
              ? "Password is required."
              : "Work email is required.",
      fields
    };
  }
}
