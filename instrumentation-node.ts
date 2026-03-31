import { startNodeRuntimeServices } from "@/lib/runtime/startup-orchestrator";

export async function registerNodeInstrumentation() {
  await startNodeRuntimeServices();
}
