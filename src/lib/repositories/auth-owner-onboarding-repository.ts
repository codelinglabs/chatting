import { query } from "@/lib/db";
import type { OwnerOnboardingStage } from "@/lib/types";

export type UserOwnerOnboardingStateRow = {
  owner_onboarding_stage: OwnerOnboardingStage;
  owner_onboarding_site_domain: string | null;
  owner_onboarding_referral_code: string | null;
};

export async function findUserOwnerOnboardingState(userId: string) {
  const result = await query<UserOwnerOnboardingStateRow>(
    `
      SELECT
        owner_onboarding_stage,
        owner_onboarding_site_domain,
        owner_onboarding_referral_code
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function updateUserOwnerOnboardingStage(
  userId: string,
  stage: OwnerOnboardingStage
) {
  const result = await query<UserOwnerOnboardingStateRow>(
    `
      UPDATE users
      SET owner_onboarding_stage = $2
      WHERE id = $1
      RETURNING
        owner_onboarding_stage,
        owner_onboarding_site_domain,
        owner_onboarding_referral_code
    `,
    [userId, stage]
  );

  return result.rows[0] ?? null;
}

export async function updateUserOwnerOnboardingIntent(input: {
  userId: string;
  siteDomain: string | null;
  referralCode: string | null;
}) {
  const result = await query<UserOwnerOnboardingStateRow>(
    `
      UPDATE users
      SET
        owner_onboarding_site_domain = $2,
        owner_onboarding_referral_code = $3
      WHERE id = $1
      RETURNING
        owner_onboarding_stage,
        owner_onboarding_site_domain,
        owner_onboarding_referral_code
    `,
    [input.userId, input.siteDomain, input.referralCode]
  );

  return result.rows[0] ?? null;
}

export async function completeUserOwnerOnboarding(userId: string) {
  const result = await query<UserOwnerOnboardingStateRow>(
    `
      UPDATE users
      SET
        owner_onboarding_stage = 'complete',
        owner_onboarding_site_domain = NULL,
        owner_onboarding_referral_code = NULL
      WHERE id = $1
      RETURNING
        owner_onboarding_stage,
        owner_onboarding_site_domain,
        owner_onboarding_referral_code
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}
