export const PropFirmType = {
    CFD: 'CFD',
    FUTURES: 'FUTURES',
    MULTI_ASSET: 'MULTI_ASSET',
    UNKNOWN: 'UNKNOWN',
  } as const;
  
  export type PropFirmType = (typeof PropFirmType)[keyof typeof PropFirmType];
  
  export const DEFAULT_PROP_FIRM_TYPE = PropFirmType.UNKNOWN;