import type { AuditChangeIntent } from '@shared/domain/audit/schemas/AuditChangeIntent';

export interface IChangeRecorderPort {
  record(change: AuditChangeIntent): void;
  list(): AuditChangeIntent[];
  clear(): void;
}
