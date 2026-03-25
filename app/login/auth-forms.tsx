"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  loginAction,
  signupAction,
  type AuthActionState
} from "./actions";

const INITIAL_AUTH_STATE: AuthActionState = {
  error: null,
  ok: false,
  fields: {
    email: "",
    password: "",
    siteName: ""
  }
};

function SubmitButton({
  idleLabel,
  pendingLabel,
  tone
}: {
  idleLabel: string;
  pendingLabel: string;
  tone: "ink" | "tide";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-5 py-3 font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70 ${
        tone === "ink" ? "bg-ink" : "bg-tide"
      }`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function ErrorMessage({ state }: { state: AuthActionState }) {
  if (!state.error) {
    return null;
  }

  return (
    <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {state.error}
    </div>
  );
}

export function AuthForms() {
  const router = useRouter();
  const [signupState, signupFormAction] = useActionState(signupAction, INITIAL_AUTH_STATE);
  const [loginState, loginFormAction] = useActionState(loginAction, INITIAL_AUTH_STATE);

  useEffect(() => {
    if (signupState.ok || loginState.ok) {
      router.replace("/dashboard");
    }
  }, [loginState.ok, router, signupState.ok]);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="glass-panel rounded-[2rem] p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-tide">Create account</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink">Start your workspace</h2>
        <form action={signupFormAction} className="mt-6 space-y-4">
          <ErrorMessage state={signupState} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Work email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={signupState.fields.email}
              autoComplete="email"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-tide"
              placeholder="you@company.com"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              defaultValue={signupState.fields.password}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-tide"
              placeholder="At least 8 characters"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">First site name</span>
              <input
                name="siteName"
                type="text"
                defaultValue={signupState.fields.siteName}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-tide"
                placeholder="Acme"
              />
            </label>
          <SubmitButton
            idleLabel="Create account"
            pendingLabel="Creating..."
            tone="ink"
          />
        </form>
      </div>

      <div className="glass-panel rounded-[2rem] p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-highlight">Sign in</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink">Open your inbox</h2>
        <form action={loginFormAction} className="mt-6 space-y-4">
          <ErrorMessage state={loginState} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Work email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={loginState.fields.email}
              autoComplete="email"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-tide"
              placeholder="you@company.com"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              defaultValue={loginState.fields.password}
              autoComplete="current-password"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-tide"
              placeholder="Your account password"
            />
          </label>
          <SubmitButton idleLabel="Sign in" pendingLabel="Signing in..." tone="tide" />
        </form>
      </div>
    </section>
  );
}
