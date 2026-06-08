import { z } from 'zod';

import { JsonValueSchema } from '@shared/kernel/json/JsonValue';

export const ActorTypeSchema = z.enum(['USER', 'ADMIN', 'SYSTEM', 'PROVIDER', 'BILLING_PROVIDER']);
export type ActorType = z.infer<typeof ActorTypeSchema>;

export const OperationSourceSchema = z.enum([
  'HTTP_API',
  'WORKER',
  'SCHEDULED_JOB',
  'PROVIDER_WEBHOOK',
  'SYSTEM_INTERNAL',
]);
export type OperationSource = z.infer<typeof OperationSourceSchema>;

export const ActorRefSchema = z.object({
  type: ActorTypeSchema,
  id: z.string().min(1).nullable(),
});
export type ActorRef = z.infer<typeof ActorRefSchema>;

export const OperationContextSchema = z.object({
  actor: ActorRefSchema,
  correlationId: z.string().min(1),
  causationId: z.string().min(1).optional(),
  requestId: z.string().min(1).optional(),
  source: OperationSourceSchema,
  metadataJson: JsonValueSchema.optional(),
});
export type OperationContext = z.infer<typeof OperationContextSchema>;
