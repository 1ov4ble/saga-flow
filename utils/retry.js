export async function withRetry(operation, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = () => {}
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }

      await onRetry(error, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

export function createRetryPolicy(options) {
  return (operation) => withRetry(operation, options);
} 