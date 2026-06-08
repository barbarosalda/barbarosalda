import { z } from 'zod';

export const UserAccessBlockedReasonSchema = z.enum(['USER_DISABLED', 'USER_DELETED']);
export type UserAccessBlockedReason = z.infer<typeof UserAccessBlockedReasonSchema>;

export const UserAccessNextActionSchema = z.object({
  type: z.literal('REDIRECT'),
  target: z.string().min(1),
});
export type UserAccessNextAction = z.infer<typeof UserAccessNextActionSchema>;

const UserAccessBlockedReasonToNextAction: Record<UserAccessBlockedReason, UserAccessNextAction> = {
  USER_DISABLED: { type: 'REDIRECT', target: '/account-disabled' },
  USER_DELETED: { type: 'REDIRECT', target: '/restore-account' },
};

export class UserAccessBlockedError extends Error {
  public readonly reason: UserAccessBlockedReason;
  public readonly safeMessage: string;
  public readonly nextAction: UserAccessNextAction;

  constructor(reason: UserAccessBlockedReason, message = 'User access is blocked.') {
    super(message);
    this.name = 'UserAccessBlockedError';
    this.reason = UserAccessBlockedReasonSchema.parse(reason);
    this.safeMessage = 'User access is currently blocked.';
    this.nextAction = UserAccessNextActionSchema.parse(UserAccessBlockedReasonToNextAction[this.reason]);
  }
}
