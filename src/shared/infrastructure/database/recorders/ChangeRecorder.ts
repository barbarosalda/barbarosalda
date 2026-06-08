import type { IChangeRecorderPort } from '@shared/application/ports/audit/IChangeRecorderPort';
import {
  AuditChangeIntentSchema,
  type AuditChangeIntent,
} from '@shared/domain/audit/schemas/AuditChangeIntent';

export class ChangeRecorder implements IChangeRecorderPort {
  private readonly changes: AuditChangeIntent[] = [];

  record(change: AuditChangeIntent): void {
    const parsedChange = AuditChangeIntentSchema.parse(change);
    this.changes.push(parsedChange);
  }

  list(): AuditChangeIntent[] {
    return [...this.changes];
  }

  clear(): void {
    this.changes.length = 0;
  }
}
