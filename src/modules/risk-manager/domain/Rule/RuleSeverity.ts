export const RuleSeverity = {
    INFO: 'INFO',
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export type RuleSeverity = (typeof RuleSeverity)[keyof typeof RuleSeverity];

export const DEFAULT_RULE_SEVERITY = RuleSeverity.MEDIUM;
