import type { IntegrationConnectionStatus } from '@modules/integration/domain/IntegrationConnection/IntegrationConnectionStatus';
import type { IntegrationConnection } from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import type {
  CreateIntegrationProviderInput,
  IntegrationProvider,
} from '@modules/integration/domain/IntegrationProvider/IntegrationProvider';
import type { PlatformIntegrationEvent } from '@modules/integration/domain/events/PlatformIntegrationEvent';
import type { JsonValue } from '@shared/kernel/json/JsonValue';

export type PlatformIntegrationProviderDefinition = CreateIntegrationProviderInput;

export type PlatformIntegrationConnectionCommand = {
  provider: IntegrationProvider;
  connection: IntegrationConnection;
  correlationId: string;
  payloadJson?: JsonValue;
};

export type PlatformIntegrationReceivedEventCommand = {
  provider: IntegrationProvider;
  connection: IntegrationConnection;
  eventType: string;
  correlationId: string;
  payloadJson: JsonValue;
  rawPayloadJson?: JsonValue;
};

export type PlatformIntegrationConnectionResult = {
  status: IntegrationConnectionStatus;
  providerExternalUserId?: string | null;
  credentialsRef?: string | null;
  connectedAt?: Date | null;
  disconnectedAt?: Date | null;
  lastError?: string | null;
  metadataJson?: JsonValue | null;
  events: PlatformIntegrationEvent[];
};

export type PlatformIntegrationReceivedEventResult = {
  events: PlatformIntegrationEvent[];
};

/**
 * Platform adapter contract.
 *
 * Adapters own provider-specific connection mechanics only. They do not update
 * TraderLock state directly and they do not call risk/account modules.
 */
export interface IPlatformIntegration {
  readonly adapterKey: string;
  readonly providerDefinition: PlatformIntegrationProviderDefinition;
  isPlatformConnected: boolean;

  connect(
    command: PlatformIntegrationConnectionCommand,
  ): Promise<PlatformIntegrationConnectionResult>;

  disconnect(
    command: PlatformIntegrationConnectionCommand,
  ): Promise<PlatformIntegrationConnectionResult>;

  receiveEvent(
    command: PlatformIntegrationReceivedEventCommand,
  ): Promise<PlatformIntegrationReceivedEventResult>;
}
