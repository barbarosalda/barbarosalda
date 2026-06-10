import { z } from 'zod';

import { VerifiedAuthIdentitySchema } from '@shared/domain/Auth/schemas/VerifiedAuthIdentity';
import { JsonValueSchema } from '@shared/kernel/json/JsonValue';
import { PlatformIntegrationEventSchema } from '@modules/integration/domain/events/PlatformIntegrationEvent';

export const ReceivePlatformIntegrationEventCommand = z.object({
  identity: VerifiedAuthIdentitySchema,
  connectionId: z.string().min(1),
  eventType: z.string().min(1),
  payloadJson: JsonValueSchema,
  rawPayloadJson: JsonValueSchema.optional(),
  correlationId: z.string().min(1),
  requestId: z.string().min(1).optional(),
});

export type ReceivePlatformIntegrationEventCommand = z.infer<
  typeof ReceivePlatformIntegrationEventCommand
>;

export const ReceivePlatformIntegrationEventResult = z.object({
  events: z.array(PlatformIntegrationEventSchema),
});

export type ReceivePlatformIntegrationEventResult = z.infer<
  typeof ReceivePlatformIntegrationEventResult
>;
