export async function startNodeRuntimeServices() {
  const {
    assertStartupProductionCoreEnvConfigured,
    assertR2EnvConfigured,
    assertStripeBillingEnvConfigured
  } = await import("@/lib/env.server");
  const { growthLifecycleScheduler } = await import("@/lib/runtime/growth-lifecycle-scheduler");

  assertStartupProductionCoreEnvConfigured();
  assertR2EnvConfigured();
  assertStripeBillingEnvConfigured();
  growthLifecycleScheduler.start();
}
