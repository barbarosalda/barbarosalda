import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import type { PlatformIntegrationEvent } from '@modules/integration/domain/events/PlatformIntegrationEvent';
import { toPlatformIntegrationTransportEvent } from '@modules/integration/application/services/platformIntegrationEventMapper';

export async function publishPlatformIntegrationEvents(
  messenger: IMessengerPort,
  events: PlatformIntegrationEvent[],
): Promise<void> {
  if (events.length === 0) return;

  await messenger.publishMany(events.map(toPlatformIntegrationTransportEvent));
}
