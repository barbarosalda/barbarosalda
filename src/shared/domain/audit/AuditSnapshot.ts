import { z } from 'zod';

import { JsonValueSchema } from '@shared/kernel/json/JsonValue';

export const AuditSnapshotSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  schemaVersion: z.number().int().positive(),
  data: JsonValueSchema,
});

export type AuditSnapshot = z.infer<typeof AuditSnapshotSchema>;
