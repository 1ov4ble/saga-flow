# saga-flow

A JavaScript library for implementing the Saga pattern in distributed transactions

## Installation

```bash
npm install saga-flow
```

## Basic Usage

```javascript
import {
  createSaga,
  defineStep,
  defineParallelSteps,
  withRetry,
  withTimeout,
  logger
} from 'saga-flow';

// Create a basic Saga
const saga = createSaga()
  .step(defineStep({
    name: 'CreateOrder',
    action: async () => {
      // Order creation logic
      return { orderId: 1 };
    },
    compensate: async () => {
      // Order cancellation logic
      return { orderCancelled: true };
    }
  }))
  .step(defineStep({
    name: 'ChargeCard',
    action: async (ctx) => {
      // Payment logic
      return { paymentId: 1 };
    },
    compensate: async () => {
      // Payment refund logic
      return { refunded: true };
    }
  }));

// Execute
await saga.run();
```

## Advanced Features

### 1. Parallel Execution

```javascript
const saga = createSaga()
  .step(createOrderStep)
  .parallel(defineParallelSteps([
    {
      name: 'ChargeCard',
      action: async (ctx) => {
        // Payment logic
      }
    },
    {
      name: 'SendEmail',
      action: async () => {
        // Email sending logic
      }
    }
  ]));
```

### 2. Retry and Timeout

```javascript
const saga = createSaga()
  .step(defineStep({
    name: 'RetryStep',
    action: async () => {
      return await withRetry(
        () => withTimeout(
          async () => {
            // Perform operation
          },
          5000, // 5 second timeout
          'Operation timed out'
        ),
        {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffFactor: 2,
          onRetry: (error, attempt) => {
            logger.warn(`Retry ${attempt}/3: ${error.message}`);
          }
        }
      );
    }
  }));
```

### 3. Event Handling

```javascript
const saga = createSaga()
  .step(createOrderStep)
  .on('onStart', (ctx) => logger.info('Saga started:', ctx))
  .on('onSuccess', (ctx) => logger.info('Saga succeeded:', ctx))
  .on('onError', (error) => logger.error('Saga failed:', error))
  .on('onCompensate', (ctx) => logger.info('Compensation executed:', ctx));
```

### 4. Scheduling

```javascript
// Run every 5 minutes
const taskId = scheduleSaga(saga, '*/5 * * * *');

// Cancel later
cancelScheduledSaga(taskId);
```

### 5. State Management

```javascript
// Save state
const sagaId = 'order-123';
exportSagaState(sagaId, saga);

// Get state
const state = getSagaState(sagaId);

// Restore state
const restoredSaga = resumeSaga(sagaId, createSaga());

// Clear state
clearSagaState(sagaId);
```

### 6. Snapshot Management

```javascript
// Register snapshot exporter
registerSnapshotExporter(async (snapshot) => {
  // Save snapshot to file or database
  await saveToDatabase(snapshot);
});

// Export snapshot
await exportSnapshot(sagaId, saga);
```

### 7. Parallel Processing Utility

```javascript
const results = await executeParallel([
  async () => { /* Task 1 */ },
  async () => { /* Task 2 */ },
  async () => { /* Task 3 */ }
], {
  concurrency: 2,
  onProgress: ({ completed, total, success }) => {
    logger.info(`Progress: ${completed}/${total}`);
  },
  stopOnError: false
});
```

### 8. Logging

```javascript
import { logger } from 'saga-flow';

// Set log level
logger.setLogLevel('DEBUG');

// Log messages
logger.debug('Debug message', { data: 123 });
logger.info('Info message', { data: 456 });
logger.warn('Warning message', { data: 789 });
logger.error('Error message', { error: new Error('Test') });
```

## API Reference

### Core API

- `createSaga()`: Create a new Saga instance
- `defineStep(options)`: Define a Step
- `defineParallelSteps(steps)`: Define Steps for parallel execution

### State Management API

- `exportSagaState(sagaId, state)`: Save Saga state
- `getSagaState(sagaId)`: Get saved state
- `resumeSaga(sagaId, saga)`: Restore from saved state
- `clearSagaState(sagaId)`: Clear saved state

### Scheduling API

- `scheduleSaga(saga, cronExpression)`: Schedule Saga execution
- `cancelScheduledSaga(taskId)`: Cancel scheduled Saga

### Utility API

- `withRetry(operation, options)`: Retry logic
- `withTimeout(operation, timeoutMs, errorMessage)`: Timeout handling
- `executeParallel(operations, options)`: Parallel execution
- `logger`: Logging utility

## Event List

- `onStart`: Saga started
- `onSuccess`: Saga succeeded
- `onError`: Saga failed
- `onCompensate`: Compensation executed
- `onStepSuccess`: Step succeeded
- `onStepError`: Step failed
- `onCompensateError`: Compensation failed

## License

MIT 