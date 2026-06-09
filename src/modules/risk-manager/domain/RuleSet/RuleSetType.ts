export const RuleSetType = {
    PROP_FIRM_OFFICIAL: 'PROP_FIRM_OFFICIAL',
    TRADERLOCK_SYSTEM: 'TRADERLOCK_SYSTEM',
    INFORMATION_RESTRICTION: 'INFORMATION_RESTRICTION',
    USER_CUSTOM: 'USER_CUSTOM',
    CUSTOM: 'CUSTOM',
} as const;

export type RuleSetType = (typeof RuleSetType)[keyof typeof RuleSetType];

export const DEFAULT_RULE_SET_TYPE = RuleSetType.CUSTOM;
