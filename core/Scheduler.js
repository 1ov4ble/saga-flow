const scheduledTasks = new Map();

export function scheduleSaga(saga, cronExpression) {
  const taskId = Date.now().toString();
  const interval = parseCronExpression(cronExpression);
  
  const task = setInterval(() => {
    saga.run().catch(error => {
      console.error('Scheduled saga failed:', error);
    });
  }, interval);

  scheduledTasks.set(taskId, task);
  return taskId;
}

export function cancelScheduledSaga(taskId) {
  const task = scheduledTasks.get(taskId);
  if (task) {
    clearInterval(task);
    scheduledTasks.delete(taskId);
    return true;
  }
  return false;
}

function parseCronExpression(expression) {
  const parts = expression.split(' ');
  if (parts.length !== 5) {
    throw new Error('Invalid cron expression');
  }
  
  const minutes = parts[0];
  if (minutes === '*') {
    return 60 * 1000; 
  }
  
  return parseInt(minutes) * 60 * 1000;
} 