import type { Metadata } from "next";
import { ButtonLink } from "../components/ui/Button";
import { SIGNIN_STATS } from "../login/auth-forms-config";
import { AuthFormIntro, AuthPageShell } from "../login/auth-shell";
import { verifyEmailWithToken } from "@/lib/auth-email-verification";
import { NO_INDEX_METADATA } from "@/lib/site-seo";

type VerifyPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Email Verification | Chatting",
  ...NO_INDEX_METADATA
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  let verified = false;

  if (token) {
    try {
      await verifyEmailWithToken(token);
      verified = true;
    } catch {
      verified = false;
    }
  }

  return (
    <AuthPageShell
      heroTitle="Welcome back to Chatting"
      heroDescription="Connect with your visitors in real-time. Turn conversations into customers."
      stats={SIGNIN_STATS}
    >
      <div>
        <p className="text-center text-sm uppercase tracking-[0.28em] text-slate-400">
          {verified ? "Email verified" : "Verification link expired"}
        </p>
        <div className="mt-3">
          <AuthFormIntro
            title={verified ? "You're all set." : "That link didn't work."}
            caption={
              verified
                ? "Your email address is verified. You can sign in and keep going."
                : "That verification link is invalid or has expired. Request a fresh one to finish verifying your email."
            }
          />
        </div>
        <div className="mt-10 space-y-3">
          <ButtonLink href="/login" fullWidth trailingIcon={<span aria-hidden="true">→</span>}>
            Sign in
          </ButtonLink>
          <ButtonLink href="/login?mode=verify" variant="secondary" fullWidth>
            Resend verification email
          </ButtonLink>
        </div>
      </div>
    </AuthPageShell>
  );
}
