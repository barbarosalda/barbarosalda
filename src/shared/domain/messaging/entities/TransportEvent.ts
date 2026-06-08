/**
 * Serializable domain event ready for transport (e.g. RabbitMQ).
 */
export type TransportEvent = {
  type: string;
  version?: number;
  occurredAt: Date;
  payload: unknown;
  correlationId?: string;
};
