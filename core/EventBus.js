const eventHandlers = new Map();

export function onEvent(event, handler) {
  if (!eventHandlers.has(event)) {
    eventHandlers.set(event, new Set());
  }
  eventHandlers.get(event).add(handler);
  return () => {
    const handlers = eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  };
}

export function emitEvent(event, data) {
  const handlers = eventHandlers.get(event);
  if (handlers) {
    handlers.forEach(handler => handler(data));
  }
} 