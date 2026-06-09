export const RuleGroupType = {
    SYSTEM: 'SYSTEM',
    PROP_FIRM: 'PROP_FIRM',
    ACCOUNT: 'ACCOUNT',
    USER_CUSTOM: 'USER_CUSTOM',
} as const;

export type RuleGroupType = (typeof RuleGroupType)[keyof typeof RuleGroupType];

export const DEFAULT_RULE_GROUP_TYPE = RuleGroupType.ACCOUNT;
