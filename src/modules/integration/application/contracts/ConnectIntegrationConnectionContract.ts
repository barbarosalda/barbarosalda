import { z } from 'zod';

import { VerifiedAuthIdentitySchema } from '@shared/domain/Auth/schemas/VerifiedAuthIdentity';
import { JsonValueSchema } from '@shared/kernel/json/JsonValue';
import { IntegrationConnectionSchema } from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import { PlatformIntegrationEventSchema } from '@modules/integration/domain/events/PlatformIntegrationEvent';

export const ConnectIntegrationConnectionCommand = z.object({
  identity: VerifiedAuthIdentitySchema,
  providerId: z.string().min(1),
  payloadJson: JsonValueSchema.optional(),
  correlationId: z.string().min(1),
  requestId: z.string().min(1).optional(),
});

export type ConnectIntegrationConnectionCommand = z.infer<
  typeof ConnectIntegrationConnectionCommand
>;

export const ConnectIntegrationConnectionResult = z.object({
  connection: IntegrationConnectionSchema,
  events: z.array(PlatformIntegrationEventSchema),
});

export type ConnectIntegrationConnectionResult = z.infer<
  typeof ConnectIntegrationConnectionResult
>;
