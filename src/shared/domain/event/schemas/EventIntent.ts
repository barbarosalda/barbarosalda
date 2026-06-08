import { z } from 'zod';

import { JsonValueSchema } from '@shared/kernel/json/JsonValue';

export const EventCategorySchema = z.enum([
  'USER',
  'SYSTEM',
  'RISK',
  'PROTECTION',
  'INTEGRATION',
  'BILLING',
  'NOTIFICATION',
  'INFORMATION',
  'INSIGHT',
]);
export type EventCategory = z.infer<typeof EventCategorySchema>;

export const EventTargetRefSchema = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
});
export type EventTargetRef = z.infer<typeof EventTargetRefSchema>;

export const EventIntentSchema = z.object({
  type: z.string().min(1),
  category: EventCategorySchema,
  target: EventTargetRefSchema.optional(),
  providerId: z.string().min(1).optional(),
  orderingKey: z.string().min(1).optional(),
  payloadJson: JsonValueSchema,
  rawPayloadJson: JsonValueSchema.optional(),
  metadataJson: JsonValueSchema.optional(),
});
export type EventIntent = z.infer<typeof EventIntentSchema>;
