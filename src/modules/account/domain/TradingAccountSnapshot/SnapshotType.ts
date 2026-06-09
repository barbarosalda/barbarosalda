export const SnapshotType = {
    EVENT: 'EVENT',
    MANUAL: 'MANUAL',
} as const;

export type SnapshotType = (typeof SnapshotType)[keyof typeof SnapshotType];

export const DEFAULT_SNAPSHOT_TYPE = SnapshotType.EVENT;
