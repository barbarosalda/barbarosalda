import { z } from 'zod';
import { PropFirmSchema, PropFirmWithProgramsAndStagesSchema } from '../../domain/PropFirm/PropFirm.ts';

/* Get Prop Firms ------------------------------------------------------------- */


/**
 * Result for getting prop firms.
 * @returns The result.
 */
export const GetPropFirmsResult = z.object({
  propFirms: z.array(PropFirmSchema),
});

export type GetPropFirmsResult = z.infer<
  typeof GetPropFirmsResult
>;


/* Get Prop Firm Details ------------------------------------------------------------- */


/**
 * Command for getting prop firm details.
 * @returns The command.
 */
export const GetPropFirmDetailsCommand = z.object({
  propFirmId: z.string().min(1),
});

export type GetPropFirmDetailsCommand = z.infer<
  typeof GetPropFirmDetailsCommand
>;

/**
 * Result for getting prop firm details.
 * @returns The result.
 */
export const GetPropFirmDetailsResult = z.object({
  propFirm: PropFirmWithProgramsAndStagesSchema,
});

export type GetPropFirmDetailsResult = z.infer<
  typeof GetPropFirmDetailsResult
>;
