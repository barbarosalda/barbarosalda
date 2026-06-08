import { z } from 'zod';

import { JsonValueSchema } from '../../kernel/json/JsonValue.ts';

export const AuditSnapshotSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  schemaVersion: z.number().int().positive(),
  data: JsonValueSchema,
});

export type AuditSnapshot = z.infer<typeof AuditSnapshotSchema>;
