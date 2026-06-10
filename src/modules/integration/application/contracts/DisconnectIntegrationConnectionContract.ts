import { z } from 'zod';

import { VerifiedAuthIdentitySchema } from '@shared/domain/Auth/schemas/VerifiedAuthIdentity';
import { IntegrationConnectionSchema } from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import { PlatformIntegrationEventSchema } from '@modules/integration/domain/events/PlatformIntegrationEvent';

export const DisconnectIntegrationConnectionCommand = z.object({
  identity: VerifiedAuthIdentitySchema,
  connectionId: z.string().min(1),
  correlationId: z.string().min(1),
  requestId: z.string().min(1).optional(),
});

export type DisconnectIntegrationConnectionCommand = z.infer<
  typeof DisconnectIntegrationConnectionCommand
>;

export const DisconnectIntegrationConnectionResult = z.object({
  connection: IntegrationConnectionSchema,
  events: z.array(PlatformIntegrationEventSchema),
});

export type DisconnectIntegrationConnectionResult = z.infer<
  typeof DisconnectIntegrationConnectionResult
>;
