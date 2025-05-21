export function defineStep({
  name,
  action,
  compensate,
  retry = 0,
  timeout = 0
}) {
  return {
    name,
    action: async (context) => {
      let attempts = 0;
      const startTime = Date.now();

      while (attempts <= retry) {
        try {
          if (timeout > 0) {
            const result = await Promise.race([
              action(context),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Step ${name} timed out`)), timeout)
              )
            ]);
            return result;
          }
          return await action(context);
        } catch (error) {
          attempts++;
          if (attempts > retry) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 10000)));
        }
      }
    },
    compensate
  };
}

export function defineParallelSteps(steps) {
  return steps.map(step => defineStep(step));
} 