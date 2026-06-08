/**
 * Severity levels supported by logger adapters.
 *
 * Ordered least-verbose → most-verbose. `silent` (index 0) suppresses all
 * output; `fatal` (index 1) is the most severe real level; `trace` (index 6)
 * is the most verbose. Adapters use array index comparisons to filter output.
 */
export const LOG_LEVELS = ['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];
