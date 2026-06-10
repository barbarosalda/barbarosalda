import { z } from 'zod';

import { IntegrationProviderSchema } from '@src/modules/integration/domain/IntegrationProvider/IntegrationProvider';

export const PropFirmProgramSupportedPlatformSchema = z.object({
  prop_firm_program_id: z.string().min(1),
  integration_provider_id: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PropFirmProgramSupportedPlatform = z.infer<
  typeof PropFirmProgramSupportedPlatformSchema
>;

export const PropFirmProgramSupportedPlatformWithProviderSchema =
  PropFirmProgramSupportedPlatformSchema.extend({
    integration_provider: IntegrationProviderSchema,
  });

export type PropFirmProgramSupportedPlatformWithProvider = z.infer<
  typeof PropFirmProgramSupportedPlatformWithProviderSchema
>;
