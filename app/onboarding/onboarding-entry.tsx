import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createSiteForUser, getOnboardingData } from "@/lib/data";
import { normalizeOnboardingStep } from "@/lib/data/onboarding";
import type { Site } from "@/lib/types";
import { OnboardingFlow } from "./onboarding-flow";
import type { OnboardingFlowStep } from "./onboarding-flow-shared";

function resolveInitialStep(input: {
  requestedStep: string | undefined;
  persistedStep: OnboardingFlowStep;
}): OnboardingFlowStep {
  const requestedStep = normalizeOnboardingStep(input.requestedStep, input.persistedStep) as OnboardingFlowStep;
  const normalizedPersistedStep = normalizeOnboardingStep(input.persistedStep, "customize") as OnboardingFlowStep;
  const order = ["customize", "install"] as const;
  const persistedIndex = order.indexOf(normalizedPersistedStep as (typeof order)[number]);
  const requestedIndex = order.indexOf(requestedStep as (typeof order)[number]);

  if (requestedIndex === -1 || requestedIndex > persistedIndex) {
    return normalizedPersistedStep;
  }

  return requestedStep;
}

export async function OnboardingEntry({
  requestedStep
}: {
  requestedStep?: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signup");
  }

  const onboarding = await getOnboardingData(user.id);
  let site: Site | null = onboarding.site;

  if (!site) {
    site = await createSiteForUser(user.id, {
      name: "My site"
    });
  }

  if (onboarding.step === "done") {
    redirect("/dashboard");
  }

  const persistedStep = normalizeOnboardingStep(onboarding.step, "customize") as OnboardingFlowStep;
  const initialStep = resolveInitialStep({
    requestedStep,
    persistedStep
  });

  return (
    <OnboardingFlow
      initialStep={initialStep}
      initialSite={site}
    />
  );
}
