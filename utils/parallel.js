export async function executeParallel(operations, options = {}) {
  const {
    concurrency = Infinity,
    onProgress = () => {},
    stopOnError = false
  } = options;

  const results = [];
  const errors = [];
  let completed = 0;

  const chunks = [];
  for (let i = 0; i < operations.length; i += concurrency) {
    chunks.push(operations.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const chunkPromises = chunk.map(async (operation, index) => {
      try {
        const result = await operation();
        results.push(result);
        completed++;
        await onProgress({ completed, total: operations.length, success: true });
        return result;
      } catch (error) {
        errors.push(error);
        completed++;
        await onProgress({ completed, total: operations.length, success: false, error });
        if (stopOnError) {
          throw error;
        }
        return null;
      }
    });

    await Promise.all(chunkPromises);
  }

  return {
    results,
    errors,
    hasErrors: errors.length > 0
  };
}

export function createParallelExecutor(options) {
  return (operations) => executeParallel(operations, options);
} 