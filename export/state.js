const sagaStates = new Map();

export function exportSagaState(sagaId, state) {
  const snapshot = {
    id: sagaId,
    timestamp: Date.now(),
    status: state.status,
    context: state.context,
    steps: state.steps.map(step => ({
      name: step.name,
      status: step.status || 'pending'
    }))
  };
  
  sagaStates.set(sagaId, snapshot);
  return snapshot;
}

export function resumeSaga(sagaId, saga) {
  const state = sagaStates.get(sagaId);
  if (!state) {
    throw new Error(`Saga state not found for id: ${sagaId}`);
  }

  // Restore context
  Object.assign(saga.context, state.context);

  // Restart from failed step
  const failedStepIndex = state.steps.findIndex(step => step.status === 'failed');
  if (failedStepIndex !== -1) {
    saga.steps = saga.steps.slice(failedStepIndex);
  }

  return saga;
}

export function getSagaState(sagaId) {
  return sagaStates.get(sagaId);
}

export function clearSagaState(sagaId) {
  sagaStates.delete(sagaId);
} 