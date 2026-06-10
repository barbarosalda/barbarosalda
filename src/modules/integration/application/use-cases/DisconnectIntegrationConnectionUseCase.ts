import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import type { UpdateIntegrationConnectionInput } from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import {
  IntegrationConnectionAuditActions,
  toIntegrationConnectionAuditSnapshot,
} from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import type { IIntegrationConnectionRepository } from '@modules/integration/application/port/repository/IIntegrationConnectionRepository';
import type { IIntegrationProviderRepository } from '@modules/integration/application/port/repository/IIntegrationProviderRepository';
import type { IPlatformIntegrationRegistry } from '@modules/integration/application/port/platform-integration/IPlatformIntegrationRegistry';
import {
  DisconnectIntegrationConnectionCommand,
  DisconnectIntegrationConnectionResult,
} from '@modules/integration/application/contracts/DisconnectIntegrationConnectionContract';
import { enqueuePlatformIntegrationEvents } from '@modules/integration/application/services/platformIntegrationEventMapper';
import { publishPlatformIntegrationEvents } from '@modules/integration/application/services/publishPlatformIntegrationEvents';

/**
 * Use case for disconnecting an integration connection.
 * @param deps - The dependencies.
 * @returns The use case.
 */
export class DisconnectIntegrationConnectionUseCase {
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
    command: DisconnectIntegrationConnectionCommand,
  ): Promise<DisconnectIntegrationConnectionResult> {
    const parsed = DisconnectIntegrationConnectionCommand.parse(command);
    const userId = parsed.identity.userId;

    const result = await this.unitOfWork.execute(
      {
        actor: { type: 'USER', id: userId },
        correlationId: parsed.correlationId,
        requestId: parsed.requestId,
        source: 'HTTP_API',
        metadataJson: {
          connectionId: parsed.connectionId,
        },
      },
      async (tx) => {
        const connection = await this.integrationConnectionRepository.findById(
          parsed.connectionId,
          tx,
        );

        if (!connection || connection.user_id !== userId) {
          throw new Error(`Integration connection not found: ${parsed.connectionId}`);
        }

        const provider = await this.integrationProviderRepository.findById(connection.provider_id, tx);

        if (!provider) {
          throw new Error(`Integration provider not found: ${connection.provider_id}`);
        }

        const platformIntegration = this.platformIntegrationRegistry.get(provider.adapter_key);
        const adapterResult = await platformIntegration.disconnect({
          provider,
          connection,
          correlationId: parsed.correlationId,
        });

        const updateInput: UpdateIntegrationConnectionInput = {
          status: adapterResult.status,
          last_error: adapterResult.lastError ?? null,
        };

        if (adapterResult.providerExternalUserId !== undefined) {
          updateInput.provider_external_user_id = adapterResult.providerExternalUserId;
        }
        if (adapterResult.credentialsRef !== undefined) {
          updateInput.credentials_ref = adapterResult.credentialsRef;
        }
        if (adapterResult.connectedAt !== undefined) {
          updateInput.connected_at = adapterResult.connectedAt;
        }
        if (adapterResult.disconnectedAt !== undefined) {
          updateInput.disconnected_at = adapterResult.disconnectedAt;
        }
        if (adapterResult.metadataJson !== undefined) {
          updateInput.metadata_json = adapterResult.metadataJson;
        }

        const updatedConnection = await this.integrationConnectionRepository.updateById(
          connection.id,
          updateInput,
          tx,
        );

        tx.changes.record({
          action: IntegrationConnectionAuditActions.IntegrationConnectionUpdated,
          target: { type: 'integration_connection', id: updatedConnection.id },
          beforeSnapshot: toIntegrationConnectionAuditSnapshot(connection),
          afterSnapshot: toIntegrationConnectionAuditSnapshot(updatedConnection),
          category: 'USER_ACTION',
          severity: 'INFO',
        });

        enqueuePlatformIntegrationEvents(tx, adapterResult.events);

        return DisconnectIntegrationConnectionResult.parse({
          connection: updatedConnection,
          events: adapterResult.events,
        });
      },
    );

    await publishPlatformIntegrationEvents(this.messenger, result.events);

    return result;
  }
}
