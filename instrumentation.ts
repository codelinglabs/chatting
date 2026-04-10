export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { startNodeRuntimeServices } = await import("@/lib/runtime/startup-orchestrator");
  await startNodeRuntimeServices();
}
