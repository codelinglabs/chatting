export type LandingBillingInterval = "monthly" | "yearly";

type LandingPricingTier = {
  min: number;
  max: number;
  monthlySeatPrice: number;
  yearlySeatPrice: number;
};

type FixedPlanPrice = {
  cadenceLabel: "/month" | "/year";
  totalLabel: string;
  yearlyNote: string | null;
};

type ProPricingQuote = {
  cadenceLabel: "/month" | "/year";
  perUserLabel: string;
  savingsLabel: string | null;
  teamLabel: string;
  totalLabel: string;
  valueText: string;
};

export const LANDING_STARTER_MONTHLY_TOTAL = 29;
export const LANDING_STARTER_YEARLY_TOTAL = 290;
export const LANDING_FREE_MONTHLY_TOTAL = 0;
export const LANDING_PRO_MIN_TEAM_SIZE = 4;
export const LANDING_PRO_MAX_TEAM_SIZE = 50;
export const LANDING_PRO_DEFAULT_TEAM_SIZE = 4;
export const LANDING_PRICING_YEARLY_SAVINGS_LABEL = "Save 2 months";
export const LANDING_FREE_FEATURES = [
  "1 team member",
  "20 conversations per month"
] as const;
export const LANDING_STARTER_FEATURES = [
  "Up to 3 team members",
  "Unlimited conversations",
  "Custom branding"
] as const;
export const LANDING_PRO_FEATURES = [
  "4-50 team members",
  "Everything in Starter",
  "Priority support",
  "Advanced analytics",
  "API access",
  "Remove Chatly badge"
] as const;

const BASE_PRO_MONTHLY_SEAT_PRICE = 8;
const BASE_PRO_YEARLY_SEAT_PRICE = 80;
const PRO_PRICING_TIERS: LandingPricingTier[] = [
  { min: 4, max: 9, monthlySeatPrice: 8, yearlySeatPrice: 80 },
  { min: 10, max: 24, monthlySeatPrice: 7, yearlySeatPrice: 70 },
  { min: 25, max: 50, monthlySeatPrice: 6, yearlySeatPrice: 60 }
];

function formatCurrency(amount: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits
  }).format(amount);
}

function getProPricingTier(teamSize: number) {
  return PRO_PRICING_TIERS.find((tier) => teamSize >= tier.min && teamSize <= tier.max) ?? PRO_PRICING_TIERS[0];
}

function getProSavingsLabel(teamSize: number, interval: LandingBillingInterval) {
  const tier = getProPricingTier(teamSize);
  const currentSeatPrice = interval === "yearly" ? tier.yearlySeatPrice : tier.monthlySeatPrice;
  const baseSeatPrice = interval === "yearly" ? BASE_PRO_YEARLY_SEAT_PRICE : BASE_PRO_MONTHLY_SEAT_PRICE;

  if (currentSeatPrice >= baseSeatPrice) {
    return null;
  }

  const cadence = interval === "yearly" ? "/year" : "/mo";
  return `You save ${formatCurrency(teamSize * (baseSeatPrice - currentSeatPrice))}${cadence}`;
}

export function clampLandingProTeamSize(value: number) {
  return Math.min(LANDING_PRO_MAX_TEAM_SIZE, Math.max(LANDING_PRO_MIN_TEAM_SIZE, Math.round(value || 0)));
}

export function formatLandingTeamLabel(teamSize: number) {
  return `${teamSize} team member${teamSize === 1 ? "" : "s"}`;
}

export function getLandingFreePrice(): FixedPlanPrice {
  return {
    cadenceLabel: "/month",
    totalLabel: formatCurrency(LANDING_FREE_MONTHLY_TOTAL),
    yearlyNote: null
  };
}

export function getLandingStarterPrice(interval: LandingBillingInterval): FixedPlanPrice {
  const isYearly = interval === "yearly";
  const total = isYearly ? LANDING_STARTER_YEARLY_TOTAL : LANDING_STARTER_MONTHLY_TOTAL;

  return {
    cadenceLabel: isYearly ? "/year" : "/month",
    totalLabel: formatCurrency(total),
    yearlyNote: isYearly ? `${formatCurrency(LANDING_STARTER_YEARLY_TOTAL)}/year (2 months free)` : null
  };
}

export function getLandingProPricingQuote(teamSize: number, interval: LandingBillingInterval): ProPricingQuote {
  const safeTeamSize = clampLandingProTeamSize(teamSize);
  const tier = getProPricingTier(safeTeamSize);
  const isYearly = interval === "yearly";
  const seatPrice = isYearly ? tier.yearlySeatPrice : tier.monthlySeatPrice;
  const total = safeTeamSize * seatPrice;
  const cadenceLabel = isYearly ? "/year" : "/month";
  const perUserLabel = `${formatCurrency(seatPrice)} per user${isYearly ? "/year" : ""}`;
  const teamLabel = formatLandingTeamLabel(safeTeamSize);

  return {
    cadenceLabel,
    perUserLabel,
    savingsLabel: getProSavingsLabel(safeTeamSize, interval),
    teamLabel,
    totalLabel: formatCurrency(total),
    valueText: `${teamLabel} at ${formatCurrency(total)} per ${isYearly ? "year" : "month"}, ${perUserLabel}`
  };
}
