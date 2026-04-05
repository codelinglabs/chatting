import { query } from "@/lib/db";
import type { OnboardingStep, OwnerOnboardingStage } from "@/lib/types";

export type AuthUserRecord = {
  id: string;
  email: string;
  password_hash: string;
  email_verified_at: string | null;
  onboarding_step: OnboardingStep;
  onboarding_completed_at: string | null;
  owner_onboarding_stage: OwnerOnboardingStage;
  owner_onboarding_site_domain: string | null;
  owner_onboarding_referral_code: string | null;
  created_at: string;
};

export async function findAuthUserById(userId: string) {
  const result = await query<AuthUserRecord>(
    `
      SELECT id, email, password_hash, email_verified_at, created_at
      , onboarding_step, onboarding_completed_at
      , owner_onboarding_stage, owner_onboarding_site_domain, owner_onboarding_referral_code
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function findAuthUserByEmail(email: string) {
  const result = await query<AuthUserRecord>(
    `
      SELECT id, email, password_hash, email_verified_at, created_at
      , onboarding_step, onboarding_completed_at
      , owner_onboarding_stage, owner_onboarding_site_domain, owner_onboarding_referral_code
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findExistingUserIdByEmail(email: string) {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0]?.id ?? null;
}

export async function insertAuthUser(input: {
  userId: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt?: string | null;
  onboardingStep?: OnboardingStep;
  onboardingCompletedAt?: string | null;
  ownerOnboardingStage?: OwnerOnboardingStage;
  ownerOnboardingSiteDomain?: string | null;
  ownerOnboardingReferralCode?: string | null;
}) {
  await query(
    `
      INSERT INTO users (
        id, email, password_hash, email_verified_at, onboarding_step, onboarding_completed_at,
        owner_onboarding_stage, owner_onboarding_site_domain, owner_onboarding_referral_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      input.userId,
      input.email,
      input.passwordHash,
      input.emailVerifiedAt ?? null,
      input.onboardingStep ?? "done",
      input.onboardingCompletedAt ?? null,
      input.ownerOnboardingStage ?? "complete",
      input.ownerOnboardingSiteDomain ?? null,
      input.ownerOnboardingReferralCode ?? null
    ]
  );
}

export async function updateAuthUserEmail(userId: string, email: string) {
  await query(
    `
      UPDATE users
      SET email = $2
      WHERE id = $1
    `,
    [userId, email]
  );
}

export async function updateAuthUserPassword(userId: string, passwordHash: string) {
  await query(
    `
      UPDATE users
      SET password_hash = $2
      WHERE id = $1
    `,
    [userId, passwordHash]
  );
}

export async function markAuthUserEmailVerified(userId: string) {
  await query(
    `
      UPDATE users
      SET email_verified_at = COALESCE(email_verified_at, NOW())
      WHERE id = $1
    `,
    [userId]
  );
}
