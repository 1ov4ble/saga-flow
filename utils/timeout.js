export function withTimeout(operation, timeoutMs, errorMessage = 'Operation timed out') {
  return Promise.race([
    operation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

export function createTimeoutPolicy(timeoutMs, errorMessage) {
  return (operation) => withTimeout(operation, timeoutMs, errorMessage);
}

export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
} 