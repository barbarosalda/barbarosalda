import { z } from 'zod';

import { AuditSnapshotSchema } from '@shared/domain/Audit/AuditSnapshot';
import { JsonValueSchema } from '@shared/kernel/json/JsonValue';

export const AuditCategorySchema = z.enum([
  'USER_ACTION',
  'SYSTEM_ACTION',
  'PROVIDER_ACTION',
  'BILLING_ACTION',
]);
export type AuditCategory = z.infer<typeof AuditCategorySchema>;

export const AuditSeveritySchema = z.enum(['INFO', 'WARNING', 'CRITICAL']);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

export const AuditTargetRefSchema = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
});
export type AuditTargetRef = z.infer<typeof AuditTargetRefSchema>;

export const AuditChangeIntentSchema = z.object({
  action: z.string().min(1),
  target: AuditTargetRefSchema,
  beforeSnapshot: AuditSnapshotSchema.optional(),
  afterSnapshot: AuditSnapshotSchema.optional(),
  diffJson: JsonValueSchema.optional(),
  metadataJson: JsonValueSchema.optional(),
  category: AuditCategorySchema.default('USER_ACTION'),
  severity: AuditSeveritySchema.default('INFO'),
});
export type AuditChangeIntent = z.infer<typeof AuditChangeIntentSchema>;
