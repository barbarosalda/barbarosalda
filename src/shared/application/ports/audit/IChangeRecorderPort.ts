import type { AuditChangeIntent } from '@src/shared/domain/Audit/schemas/AuditChangeIntent';

export interface IChangeRecorderPort {
  record(change: AuditChangeIntent): void;
  list(): AuditChangeIntent[];
  clear(): void;
}
