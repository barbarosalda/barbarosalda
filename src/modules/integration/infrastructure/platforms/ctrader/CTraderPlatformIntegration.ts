import type {
  IPlatformIntegration,
  PlatformIntegrationConnectionCommand,
  PlatformIntegrationConnectionResult,
  PlatformIntegrationReceivedEventCommand,
  PlatformIntegrationReceivedEventResult,
} from '@modules/integration/application/port/platform-integration/IPlatformIntegration';
import { IntegrationConnectionStatus } from '@modules/integration/domain/IntegrationConnection/IntegrationConnectionStatus';
import { IntegrationAuthType } from '@modules/integration/domain/IntegrationProvider/enums/IntegrationAuthType';
import { IntegrationConnectionMode } from '@modules/integration/domain/IntegrationProvider/enums/IntegrationConnectionMode';
import { IntegrationProviderType } from '@modules/integration/domain/IntegrationProvider/enums/IntegrationProviderType';
import {
  createPlatformIntegrationEvent,
  PlatformIntegrationEventType,
} from '@modules/integration/domain/events/PlatformIntegrationEvent';
import { RecordStatus } from '@shared/domain/Record/RecordStatus';
import type { JsonValue } from '@shared/kernel/json/JsonValue';

function isJsonObject(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeMetadata(
  existingMetadata: JsonValue | null,
  nextMetadata: Record<string, JsonValue>,
): JsonValue {
  const existing: Record<string, JsonValue> = isJsonObject(existingMetadata ?? undefined)
    ? (existingMetadata as Record<string, JsonValue>)
    : {};

  return {
    ...existing,
    ...nextMetadata,
  };
}

/**
 * CTrader platform integration.
 */
export class CTraderPlatformIntegration implements IPlatformIntegration {
  readonly adapterKey = 'ctrader';

  /**
   * Provider definition.
   */
  readonly providerDefinition = {
    code: 'ctrader',
    name: 'cTrader',
    description: 'cTrader trading platform integration.',
    provider_type: IntegrationProviderType.TRADING_PLATFORM,
    auth_type: IntegrationAuthType.OAUTH,
    connection_mode: IntegrationConnectionMode.HYBRID,
    adapter_key: this.adapterKey,
    website_url: 'https://ctrader.com',
    logo_url: null,
    status: RecordStatus.ACTIVE,
  };

  /**
   * Connect to the cTrader platform.
   * @param command - The command to connect to the cTrader platform.
   * @returns The result of the connection.
   */
  async connect(
    command: PlatformIntegrationConnectionCommand,
  ): Promise<PlatformIntegrationConnectionResult> {
    const event = createPlatformIntegrationEvent({
      type: PlatformIntegrationEventType.CONNECTION_STARTED,
      userId: command.connection.user_id,
      providerId: command.provider.id,
      providerCode: command.provider.code,
      connectionId: command.connection.id,
      payloadJson: {
        adapterKey: this.adapterKey,
        status: IntegrationConnectionStatus.PENDING,
        message: 'cTrader connection workflow started.',
        data: command.payloadJson ?? null,
      },
      correlationId: command.correlationId,
    });

    return {
      status: IntegrationConnectionStatus.PENDING,
      disconnectedAt: null,
      lastError: null,
      metadataJson: mergeMetadata(command.connection.metadata_json, {
        adapterKey: this.adapterKey,
        connectionWorkflow: 'oauth_required',
      }),
      events: [event],
    };
  }

  /**
   * Disconnect from the cTrader platform.
   * @param command - The command to disconnect from the cTrader platform.
   * @returns The result of the disconnection.
   */
  async disconnect(
    command: PlatformIntegrationConnectionCommand,
  ): Promise<PlatformIntegrationConnectionResult> {
    const now = new Date();
    const event = createPlatformIntegrationEvent({
      type: PlatformIntegrationEventType.CONNECTION_DISCONNECTED,
      userId: command.connection.user_id,
      providerId: command.provider.id,
      providerCode: command.provider.code,
      connectionId: command.connection.id,
      occurredAt: now,
      payloadJson: {
        adapterKey: this.adapterKey,
        status: IntegrationConnectionStatus.DISCONNECTED,
      },
      correlationId: command.correlationId,
    });

    return {
      status: IntegrationConnectionStatus.DISCONNECTED,
      disconnectedAt: now,
      lastError: null,
      metadataJson: mergeMetadata(command.connection.metadata_json, {
        adapterKey: this.adapterKey,
        disconnectedBy: 'traderlock',
      }),
      events: [event],
    };
  }

  /**
   * Receive an event from the cTrader platform.
   * @param command - The command to receive an event from the cTrader platform.
   * @returns The result of the event reception.
   */
  async receiveEvent(
    command: PlatformIntegrationReceivedEventCommand,
  ): Promise<PlatformIntegrationReceivedEventResult> {
    const event = createPlatformIntegrationEvent({
      type: PlatformIntegrationEventType.PLATFORM_EVENT_RECEIVED,
      userId: command.connection.user_id,
      providerId: command.provider.id,
      providerCode: command.provider.code,
      connectionId: command.connection.id,
      payloadJson: {
        adapterKey: this.adapterKey,
        eventType: command.eventType,
        data: command.payloadJson,
      },
      rawPayloadJson: command.rawPayloadJson,
      correlationId: command.correlationId,
    });

    return { events: [event] };
  }
}
