import { z } from 'zod';

import { JsonValueSchema } from '@shared/kernel/json/JsonValue';

/**
 * Integration event names emitted by platform adapters.
 *
 * Keep these event names business-readable because they are stored in the
 * durable shared events table and can also be used as messenger routing keys.
 */
export const PlatformIntegrationEventType = {
  CONNECTION_STARTED: 'integration.connection_started',
  CONNECTION_ACTIVE: 'integration.connection_active',
  CONNECTION_FAILED: 'integration.connection_failed',
  CONNECTION_DISCONNECTED: 'integration.connection_disconnected',
  CONNECTION_EXPIRED: 'integration.connection_expired',

  PLATFORM_ACCOUNT_DISCOVERED: 'integration.platform_account_discovered',
  PLATFORM_EVENT_RECEIVED: 'integration.platform_event_received',
} as const;

export type PlatformIntegrationEventType =
  (typeof PlatformIntegrationEventType)[keyof typeof PlatformIntegrationEventType];

export const PlatformIntegrationEventSchema = z.object({
  type: z.nativeEnum(PlatformIntegrationEventType),

  userId: z.string().min(1),

  providerId: z.string().min(1),
  providerCode: z.string().min(1),

  connectionId: z.string().min(1),

  tradingAccountId: z.string().min(1).nullable().optional(),
  providerAccountId: z.string().min(1).nullable().optional(),

  occurredAt: z.date(),

  payloadJson: JsonValueSchema,
  rawPayloadJson: JsonValueSchema.optional(),

  correlationId: z.string().min(1),
});

export type PlatformIntegrationEvent = z.infer<typeof PlatformIntegrationEventSchema>;

export const CreatePlatformIntegrationEventSchema = PlatformIntegrationEventSchema.extend({
  occurredAt: z.date().optional(),
});

export type CreatePlatformIntegrationEventInput = z.infer<
  typeof CreatePlatformIntegrationEventSchema
>;

export function createPlatformIntegrationEvent(
  input: CreatePlatformIntegrationEventInput,
): PlatformIntegrationEvent {
  return PlatformIntegrationEventSchema.parse({
    ...input,
    occurredAt: input.occurredAt ?? new Date(),
  });
}
