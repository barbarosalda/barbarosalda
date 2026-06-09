export const RecordStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVED: 'ARCHIVED',
  } as const;
  export type RecordStatus = (typeof RecordStatus)[keyof typeof RecordStatus];
  export const DEFAULT_RECORD_STATUS = RecordStatus.ACTIVE;