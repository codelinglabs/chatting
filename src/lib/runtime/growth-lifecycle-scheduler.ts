import { runScheduledGrowthLifecycleEmails } from "@/lib/growth-outreach-runner";

const GROWTH_LIFECYCLE_INTERVAL_MS = 60 * 60 * 1000;

class GrowthLifecycleScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private running = false;

  start() {
    if (this.intervalId) {
      return;
    }

    void this.runCycle();
    this.intervalId = setInterval(() => {
      void this.runCycle();
    }, GROWTH_LIFECYCLE_INTERVAL_MS);
  }

  stop() {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  async runCycle() {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      await runScheduledGrowthLifecycleEmails();
    } catch (error) {
      console.error("growth lifecycle scheduler failed", error);
    } finally {
      this.running = false;
    }
  }
}

declare global {
  var __chatlyGrowthLifecycleScheduler__: GrowthLifecycleScheduler | undefined;
}

function resolveGlobalGrowthLifecycleScheduler() {
  if (!globalThis.__chatlyGrowthLifecycleScheduler__) {
    globalThis.__chatlyGrowthLifecycleScheduler__ = new GrowthLifecycleScheduler();
  }

  return globalThis.__chatlyGrowthLifecycleScheduler__;
}

export const growthLifecycleScheduler = resolveGlobalGrowthLifecycleScheduler();
