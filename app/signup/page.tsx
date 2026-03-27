import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserOnboardingStep } from "@/lib/data";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    const onboardingStep = await getUserOnboardingStep(user.id);
    redirect(onboardingStep === "done" ? "/dashboard" : `/onboarding?step=${onboardingStep}`);
  }

  return <SignupForm />;
}
