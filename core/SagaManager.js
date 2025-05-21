class SagaManager {
  constructor() {
    this.steps = [];
    this.context = {};
    this.status = 'idle';
    this.eventHandlers = new Map();
  }

  step(stepDefinition) {
    this.steps.push(stepDefinition);
    return this;
  }

  parallel(parallelSteps) {
    this.steps.push({
      type: 'parallel',
      steps: parallelSteps
    });
    return this;
  }

  async run() {
    try {
      this.status = 'running';
      this.emit('onStart', this.context);

      for (const step of this.steps) {
        if (step.type === 'parallel') {
          await this.executeParallelSteps(step.steps);
        } else {
          await this.executeStep(step);
        }
      }

      this.status = 'completed';
      this.emit('onSuccess', this.context);
    } catch (error) {
      this.status = 'failed';
      this.emit('onError', error);
      await this.compensate();
      throw error;
    }
  }

  async executeStep(step) {
    try {
      const result = await step.action(this.context);
      Object.assign(this.context, result);
      this.emit('onStepSuccess', { step, result });
    } catch (error) {
      this.emit('onStepError', { step, error });
      throw error;
    }
  }

  async executeParallelSteps(steps) {
    const promises = steps.map(step => this.executeStep(step));
    await Promise.all(promises);
  }

  async compensate() {
    this.status = 'compensating';
    this.emit('onCompensate', this.context);

    for (const step of [...this.steps].reverse()) {
      if (step.compensate) {
        try {
          await step.compensate(this.context);
        } catch (error) {
          this.emit('onCompensateError', { step, error });
        }
      }
    }
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    return this;
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  getStatus() {
    return this.status;
  }

  getContext() {
    return { ...this.context };
  }
}

export function createSaga() {
  return new SagaManager();
} 