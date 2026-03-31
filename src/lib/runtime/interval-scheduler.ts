import "server-only";

type IntervalSchedulerOptions = {
  intervalMs: number;
  failureMessage: string;
  task: () => Promise<void>;
};

export class IntervalScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly options: IntervalSchedulerOptions) {}

  start() {
    if (this.intervalId) {
      return;
    }

    void this.runCycle();
    this.intervalId = setInterval(() => {
      void this.runCycle();
    }, this.options.intervalMs);
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
      await this.options.task();
    } catch (error) {
      console.error(this.options.failureMessage, error);
    } finally {
      this.running = false;
    }
  }
}

type GlobalSchedulerStore = typeof globalThis & Record<string, IntervalScheduler | undefined>;

export function resolveGlobalIntervalScheduler(
  key: string,
  create: () => IntervalScheduler
) {
  const store = globalThis as GlobalSchedulerStore;
  store[key] ??= create();
  return store[key];
}
