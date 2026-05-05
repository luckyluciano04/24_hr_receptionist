/**
 * Lightweight structured JSON logger.
 * All output goes to stdout/stderr as newline-delimited JSON so it is
 * compatible with Vercel log drains, Datadog, and similar collectors.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  ts: string;
  msg: string;
  [key: string]: unknown;
}

function log(level: LogLevel, msg: string, meta: Record<string, unknown> = {}): void {
  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    msg,
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
