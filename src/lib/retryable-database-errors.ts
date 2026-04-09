const RETRYABLE_DATABASE_CONNECTION_MESSAGES = [
  "Authentication timed out",
  "Connection terminated unexpectedly",
  "Connection terminated due to connection timeout",
  "timeout exceeded when trying to connect"
];

export function isRetryableDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return RETRYABLE_DATABASE_CONNECTION_MESSAGES.some((message) =>
    error.message.includes(message)
  );
}

export async function withRetryableDatabaseConnectionRetry<T>(
  task: () => Promise<T>,
  maxAttempts = 2
) {
  let attempt = 0;

  while (true) {
    try {
      return await task();
    } catch (error) {
      attempt += 1;
      if (
        attempt >= maxAttempts ||
        !isRetryableDatabaseConnectionError(error)
      ) {
        throw error;
      }
    }
  }
}
