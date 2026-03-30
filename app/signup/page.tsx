import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserOnboardingStep } from "@/lib/data";
import { SignupForm } from "./signup-form";

type SignupPageProps = {
  searchParams: Promise<{
    invite?: string;
    email?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const inviteId = String(params.invite ?? "").trim();

  if (user) {
    if (inviteId) {
      redirect(`/invite?invite=${encodeURIComponent(inviteId)}${params.email ? `&email=${encodeURIComponent(params.email)}` : ""}`);
    }
    const onboardingStep = await getUserOnboardingStep(user.id);
    redirect(onboardingStep === "done" ? "/dashboard" : `/onboarding?step=${onboardingStep}`);
  }

  return <SignupForm />;
}
