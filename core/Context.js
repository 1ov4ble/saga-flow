export function getContextSnapshot(context) {
  return {
    timestamp: Date.now(),
    data: { ...context },
    version: '1.0'
  };
}

export function mergeContexts(contexts) {
  return contexts.reduce((merged, context) => ({
    ...merged,
    ...context
  }), {});
} 