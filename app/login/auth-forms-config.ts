import type { AuthActionState } from "./action-types";

export type AuthMode = "signin" | "forgot" | "reset" | "success";

export type AuthFormsProps = {
  initialMode?: Exclude<AuthMode, "success">;
  resetToken?: string;
  inviteId?: string;
  inviteEmail?: string;
  redirectTo?: string;
};

export const INITIAL_AUTH_STATE: AuthActionState = {
  error: null,
  ok: false,
  nextPath: null,
  fields: {
    email: "",
    password: "",
    websiteUrl: "",
    referralCode: ""
  }
};

export const DEFAULT_SUCCESS_COPY = {
  title: "Check your inbox",
  body: "If that email exists in Chatting, we’ve sent instructions to continue."
};

export const SIGNIN_STATS = [
  { value: "2,400+", label: "Teams" },
  { value: "1.2m", label: "Avg response" },
  { value: "4.8/5", label: "Rating" }
];
