import { z } from 'zod';

import { IntegrationProviderSchema } from '@modules/integration/domain/IntegrationProvider/IntegrationProvider';

export const ListIntegrationProvidersResult = z.object({
  providers: z.array(IntegrationProviderSchema),
});

export type ListIntegrationProvidersResult = z.infer<typeof ListIntegrationProvidersResult>;
