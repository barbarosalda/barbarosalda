export const RuleStateStatus = {
    NOT_EVALUATED: 'NOT_EVALUATED',
    COMPLIANT: 'COMPLIANT',
    WARNING: 'WARNING',
    BREACHED: 'BREACHED',
    DISABLED: 'DISABLED',
} as const;

export type RuleStateStatus = (typeof RuleStateStatus)[keyof typeof RuleStateStatus];

export const DEFAULT_RULE_STATE_STATUS = RuleStateStatus.NOT_EVALUATED;
