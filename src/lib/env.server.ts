import "server-only";

export {
  getMissingRequiredEnvVars,
  getOptionalServerEnv,
  getRequiredServerEnv
} from "@/lib/env-server/core";
export {
  getMissingEnvVarsForGroup,
  getMissingMiniMaxEnvVars,
  getMissingSesEnvVars
} from "@/lib/env-server/groups";
export {
  getAppDisplayName,
  getAuthSecret,
  getDatabaseConfig,
  getMailFromAddress,
  getMiniMaxConfig,
  getReplyDomain,
  getSesClientConfig,
  getSesInboundTopicArnSet
} from "@/lib/env-server/services";
export {
  assertR2EnvConfigured,
  assertStartupProductionCoreEnvConfigured,
  assertStripeBillingEnvConfigured,
  getMissingR2EnvVars,
  getMissingStartupProductionCoreEnvVars,
  getMissingStripeBillingEnvVars,
  getMissingStripeCheckoutEnvVars,
  isStripeBillingReady,
  isStripeConfigured
} from "@/lib/env-server/validation";
