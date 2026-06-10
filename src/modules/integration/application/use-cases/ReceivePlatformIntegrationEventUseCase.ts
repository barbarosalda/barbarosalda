import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import type { IIntegrationConnectionRepository } from '@modules/integration/application/port/repository/IIntegrationConnectionRepository';
import type { IIntegrationProviderRepository } from '@modules/integration/application/port/repository/IIntegrationProviderRepository';
import type { IPlatformIntegrationRegistry } from '@modules/integration/application/port/platform-integration/IPlatformIntegrationRegistry';
import {
  ReceivePlatformIntegrationEventCommand,
  ReceivePlatformIntegrationEventResult,
} from '@src/modules/integration/application/contracts/ReceivePlatformIntegrationEventContract';
import { enqueuePlatformIntegrationEvents } from '@modules/integration/application/services/platformIntegrationEventMapper';
import { publishPlatformIntegrationEvents } from '@modules/integration/application/services/publishPlatformIntegrationEvents';

/**
 * Use case for receiving a platform integration event.
 * @param deps - The dependencies.
 * @returns The use case.
 */
export class ReceivePlatformIntegrationEventUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWorkPort,
    private readonly messenger: IMessengerPort,
    private readonly integrationProviderRepository: IIntegrationProviderRepository,
    private readonly integrationConnectionRepository: IIntegrationConnectionRepository,
    private readonly platformIntegrationRegistry: IPlatformIntegrationRegistry,
  ) {}

  /**
   * Execute the use case.
   * @param command - The command.
   * @returns The result.
   */
  async execute(
    command: ReceivePlatformIntegrationEventCommand,
  ): Promise<ReceivePlatformIntegrationEventResult> {
    const parsed = ReceivePlatformIntegrationEventCommand.parse(command);

    const result = await this.unitOfWork.execute(
      {
        actor: { type: 'PROVIDER', id: null },
        correlationId: parsed.correlationId,
        requestId: parsed.requestId,
        source: 'PROVIDER_WEBHOOK',
        metadataJson: {
          connectionId: parsed.connectionId,
          eventType: parsed.eventType,
        },
      },
      async (tx) => {
        const connection = await this.integrationConnectionRepository.findById(
          parsed.connectionId,
          tx,
        );

        if (!connection) {
          throw new Error(`Integration connection not found: ${parsed.connectionId}`);
        }

        const provider = await this.integrationProviderRepository.findById(connection.provider_id, tx);

        if (!provider) {
          throw new Error(`Integration provider not found: ${connection.provider_id}`);
        }

        const platformIntegration = this.platformIntegrationRegistry.get(provider.adapter_key);
        const adapterResult = await platformIntegration.receiveEvent({
          provider,
          connection,
          eventType: parsed.eventType,
          payloadJson: parsed.payloadJson,
          rawPayloadJson: parsed.rawPayloadJson,
          correlationId: parsed.correlationId,
        });

        await this.integrationConnectionRepository.updateById(
          connection.id,
          {
            last_sync_at: new Date(),
            last_error: null,
          },
          tx,
        );

        enqueuePlatformIntegrationEvents(tx, adapterResult.events);

        return ReceivePlatformIntegrationEventResult.parse({ events: adapterResult.events });
      },
    );

    await publishPlatformIntegrationEvents(this.messenger, result.events);

    return result;
  }
}
