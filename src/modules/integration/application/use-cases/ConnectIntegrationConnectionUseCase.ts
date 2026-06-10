import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import type { UpdateIntegrationConnectionInput } from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import {
  IntegrationConnectionAuditActions,
  toIntegrationConnectionAuditSnapshot,
} from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import { IntegrationConnectionStatus } from '@modules/integration/domain/IntegrationConnection/IntegrationConnectionStatus';
import type { IIntegrationConnectionRepository } from '@modules/integration/application/port/repository/IIntegrationConnectionRepository';
import type { IIntegrationProviderRepository } from '@modules/integration/application/port/repository/IIntegrationProviderRepository';
import type { IPlatformIntegrationRegistry } from '@modules/integration/application/port/platform-integration/IPlatformIntegrationRegistry';
import {
  ConnectIntegrationConnectionCommand,
  ConnectIntegrationConnectionResult,
} from '@src/modules/integration/application/contracts/ConnectIntegrationConnectionContract';
import { enqueuePlatformIntegrationEvents } from '@modules/integration/application/services/platformIntegrationEventMapper';
import { publishPlatformIntegrationEvents } from '@modules/integration/application/services/publishPlatformIntegrationEvents';

/**
 * Use case for connecting an integration connection.
 * @param deps - The dependencies.
 * @returns The use case.
 */
export class ConnectIntegrationConnectionUseCase {
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
    command: ConnectIntegrationConnectionCommand,
  ): Promise<ConnectIntegrationConnectionResult> {
    const parsed = ConnectIntegrationConnectionCommand.parse(command);
    const userId = parsed.identity.userId;

    const result = await this.unitOfWork.execute(
      {
        actor: { type: 'USER', id: userId },
        correlationId: parsed.correlationId,
        requestId: parsed.requestId,
        source: 'HTTP_API',
        metadataJson: {
          providerId: parsed.providerId,
        },
      },
      async (tx) => {
        const provider = await this.integrationProviderRepository.findById(
          parsed.providerId,
          tx,
        );

        if (!provider) {
          throw new Error(`Integration provider not found: ${parsed.providerId}`);
        }

        const platformIntegration = this.platformIntegrationRegistry.get(provider.adapter_key);
        const existingConnection = await this.integrationConnectionRepository.findByUserIdAndProviderId(
          userId,
          provider.id,
          tx,
        );

        const connection = existingConnection
          ? await this.integrationConnectionRepository.updateById(
              existingConnection.id,
              {
                status: IntegrationConnectionStatus.PENDING,
                disconnected_at: null,
                last_error: null,
                metadata_json: parsed.payloadJson ?? existingConnection.metadata_json,
              },
              tx,
            )
          : await this.integrationConnectionRepository.create(
              {
                user_id: userId,
                provider_id: provider.id,
                status: IntegrationConnectionStatus.PENDING,
                metadata_json: parsed.payloadJson ?? null,
              },
              tx,
            );

        const adapterResult = await platformIntegration.connect({
          provider,
          connection,
          correlationId: parsed.correlationId,
          payloadJson: parsed.payloadJson,
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
          action: existingConnection
            ? IntegrationConnectionAuditActions.IntegrationConnectionUpdated
            : IntegrationConnectionAuditActions.IntegrationConnectionCreated,
          target: { type: 'integration_connection', id: updatedConnection.id },
          beforeSnapshot: existingConnection
            ? toIntegrationConnectionAuditSnapshot(existingConnection)
            : undefined,
          afterSnapshot: toIntegrationConnectionAuditSnapshot(updatedConnection),
          category: 'USER_ACTION',
          severity: 'INFO',
        });

        enqueuePlatformIntegrationEvents(tx, adapterResult.events);

        return ConnectIntegrationConnectionResult.parse({
          connection: updatedConnection,
          events: adapterResult.events,
        });
      },
    );

    await publishPlatformIntegrationEvents(this.messenger, result.events);
    
    return result;
  }
}
