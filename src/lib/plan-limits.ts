import type { BillingPlanKey } from "@/lib/billing-plans";
import type { ContactPlanLimits } from "@/lib/contact-types";

type AutomationPlanLimits = {
  routingRules: number | null;
  proactivePrompts: number | null;
};

type DashboardPlanLimits = {
  contacts: ContactPlanLimits;
  automation: AutomationPlanLimits;
};

const DASHBOARD_PLAN_LIMITS: Record<BillingPlanKey, DashboardPlanLimits> = {
  starter: {
    contacts: {
      fullProfiles: false,
      exportEnabled: false,
      apiEnabled: false,
      customStatusesLimit: 1,
      customFieldsLimit: 1
    },
    automation: {
      routingRules: 1,
      proactivePrompts: 1
    }
  },
  growth: {
    contacts: {
      fullProfiles: true,
      exportEnabled: true,
      apiEnabled: true,
      customStatusesLimit: null,
      customFieldsLimit: null
    },
    automation: {
      routingRules: null,
      proactivePrompts: null
    }
  }
};

export function getDashboardPlanLimits(planKey: BillingPlanKey) {
  return DASHBOARD_PLAN_LIMITS[planKey];
}

export function getContactPlanLimits(planKey: BillingPlanKey) {
  return getDashboardPlanLimits(planKey).contacts;
}

export function getAutomationRuleLimit(planKey: BillingPlanKey) {
  return getDashboardPlanLimits(planKey).automation.routingRules;
}

export function getAutomationPromptLimit(planKey: BillingPlanKey) {
  return getDashboardPlanLimits(planKey).automation.proactivePrompts;
}
