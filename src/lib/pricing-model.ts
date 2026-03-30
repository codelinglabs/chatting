export type ChattingPricingInterval = "monthly" | "annual";

export const CHATTING_FREE_MONTHLY_TOTAL_CENTS = 0;
export const CHATTING_GROWTH_BASE_TEAM_LIMIT = 3;
export const CHATTING_GROWTH_CONTACT_TEAM_SIZE = 50;
export const CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS = 2_900;
export const CHATTING_GROWTH_BASE_ANNUAL_TOTAL_CENTS = CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS * 10;
export const CHATTING_GROWTH_MEMBER_PRICE_TIERS = [
  { min: 4, max: 9, monthlyPerMemberCents: 800, annualPerMemberCents: 8_000 },
  { min: 10, max: 24, monthlyPerMemberCents: 700, annualPerMemberCents: 7_000 },
  { min: 25, max: 50, monthlyPerMemberCents: 600, annualPerMemberCents: 6_000 }
] as const;

export function formatUsdFromCents(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits
  }).format(value / 100);
}

export function normalizeGrowthMemberCount(value: number) {
  return Math.max(1, Math.floor(value || 1));
}

function getGrowthTierForMemberCount(memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);
  return CHATTING_GROWTH_MEMBER_PRICE_TIERS.find((tier) => safeMemberCount >= tier.min && safeMemberCount <= tier.max) ?? null;
}

export function getGrowthPerMemberCents(interval: ChattingPricingInterval, memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);

  if (safeMemberCount <= CHATTING_GROWTH_BASE_TEAM_LIMIT) {
    return Math.round(
      (interval === "annual" ? CHATTING_GROWTH_BASE_ANNUAL_TOTAL_CENTS : CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS) /
        safeMemberCount
    );
  }

  const tier = getGrowthTierForMemberCount(safeMemberCount);
  if (!tier) {
    return null;
  }

  return interval === "annual" ? tier.annualPerMemberCents : tier.monthlyPerMemberCents;
}

export function getGrowthTotalCentsBeforeContactSales(interval: ChattingPricingInterval, memberCount: number) {
  const safeMemberCount = normalizeGrowthMemberCount(memberCount);

  if (safeMemberCount <= CHATTING_GROWTH_BASE_TEAM_LIMIT) {
    return interval === "annual" ? CHATTING_GROWTH_BASE_ANNUAL_TOTAL_CENTS : CHATTING_GROWTH_BASE_MONTHLY_TOTAL_CENTS;
  }

  const perMemberCents = getGrowthPerMemberCents(interval, safeMemberCount);
  return perMemberCents === null ? null : safeMemberCount * perMemberCents;
}
