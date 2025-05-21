const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

let currentLogLevel = LOG_LEVELS.INFO;

export function setLogLevel(level) {
  if (LOG_LEVELS[level] === undefined) {
    throw new Error(`Invalid log level: ${level}`);
  }
  currentLogLevel = LOG_LEVELS[level];
}

export function getLogLevel() {
  return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel);
}

function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] ${level}: ${message}${dataStr}`;
}

export function debug(message, data) {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    console.debug(formatMessage('DEBUG', message, data));
  }
}

export function info(message, data) {
  if (currentLogLevel <= LOG_LEVELS.INFO) {
    console.info(formatMessage('INFO', message, data));
  }
}

export function warn(message, data) {
  if (currentLogLevel <= LOG_LEVELS.WARN) {
    console.warn(formatMessage('WARN', message, data));
  }
}

export function error(message, data) {
  if (currentLogLevel <= LOG_LEVELS.ERROR) {
    console.error(formatMessage('ERROR', message, data));
  }
}

export const logger = {
  debug,
  info,
  warn,
  error,
  setLogLevel,
  getLogLevel
}; 