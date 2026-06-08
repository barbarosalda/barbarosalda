import { Prisma } from '@generated/prisma/client';

import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { type AuditChangeIntent } from '@shared/domain/audit/schemas/AuditChangeIntent';
import type { EventIntent } from '@shared/domain/event/schemas/EventIntent';
import {
  OperationContextSchema,
  type OperationContext,
} from '@shared/domain/operation/schemas/OperationContext';
import { createId } from '@shared/kernel/ids/createId';
import { AUDIT_LOG_ID_PREFIX, EVENT_ID_PREFIX } from '@shared/kernel/ids/idPrefixes';
import type { JsonValue } from '@shared/kernel/json/JsonValue';
import { ChangeRecorder } from '../../recorders/ChangeRecorder.ts';
import { EventOutboxRecorder } from '../../recorders/EventOutboxRecorder.ts';
import { PrismaDatabaseAdapter } from './PrismaDatabaseAdapter.ts';
import { PrismaTransactionAdapter } from './PrismaTransactionAdapter.ts';

type PrismaJsonInput = Prisma.InputJsonValue | typeof Prisma.JsonNull;

export class PrismaUnitOfWorkAdapter implements IUnitOfWorkPort {
  constructor(private readonly database: PrismaDatabaseAdapter) {}

  async execute<T>(context: OperationContext, work: (tx: ITransactionPort) => Promise<T>): Promise<T> {
    const operationContext = OperationContextSchema.parse(context);

    return this.database.getClient().$transaction(async (prismaTx) => {
      const changes = new ChangeRecorder();
      const events = new EventOutboxRecorder();
      const tx = new PrismaTransactionAdapter(prismaTx, changes, events);
      const result = await work(tx);

      const pendingChanges = changes.list();
      const pendingEvents = events.list();

      await this.flushAuditChanges(prismaTx, operationContext, pendingChanges);
      await this.flushEvents(prismaTx, operationContext, pendingEvents);

      changes.clear();
      events.clear();

      return result;
    });
  }

  private async flushAuditChanges(
    tx: Prisma.TransactionClient,
    context: OperationContext,
    changes: AuditChangeIntent[],
  ): Promise<void> {
    for (const change of changes) {
      await tx.auditLog.create({
        data: {
          id: createId(AUDIT_LOG_ID_PREFIX),
          action: change.action,
          category: change.category,
          severity: change.severity,
          actor_type: context.actor.type,
          actor_id: context.actor.id,
          target_type: change.target.type,
          target_id: change.target.id,
          correlation_id: context.correlationId,
          causation_id: context.causationId,
          request_id: context.requestId,
          source: context.source,
          before_json: this.toOptionalPrismaJson(change.beforeSnapshot),
          after_json: this.toOptionalPrismaJson(change.afterSnapshot),
          diff_json: this.toOptionalPrismaJson(change.diffJson),
          metadata_json: this.toOptionalPrismaJson(change.metadataJson),
        },
      });
    }
  }

  private async flushEvents(
    tx: Prisma.TransactionClient,
    context: OperationContext,
    events: EventIntent[],
  ): Promise<void> {
    for (const event of events) {
      await tx.event.create({
        data: {
          id: createId(EVENT_ID_PREFIX),
          type: event.type,
          category: event.category,
          target_type: event.target?.type,
          target_id: event.target?.id,
          provider_id: event.providerId,
          correlation_id: context.correlationId,
          causation_id: context.causationId,
          ordering_key: event.orderingKey,
          payload_json: this.toPrismaJson(event.payloadJson),
          raw_payload_json: this.toOptionalPrismaJson(event.rawPayloadJson),
          metadata_json: this.toOptionalPrismaJson(event.metadataJson),
        },
      });
    }
  }

  private toPrismaJson(value: JsonValue): PrismaJsonInput {
    return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
  }

  private toOptionalPrismaJson(value: JsonValue | undefined): PrismaJsonInput | undefined {
    if (value === undefined) return undefined;
    return this.toPrismaJson(value);
  }
}
