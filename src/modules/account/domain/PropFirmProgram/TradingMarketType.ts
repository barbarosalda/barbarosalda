export const TradingMarketType = {
    FOREX_CFD: 'FOREX_CFD',
    FUTURES: 'FUTURES',
    CRYPTO: 'CRYPTO',
    MULTI_ASSET: 'MULTI_ASSET',
    UNKNOWN: 'UNKNOWN',
  } as const;
  
  export type TradingMarketType = (typeof TradingMarketType)[keyof typeof TradingMarketType];
  
  export const DEFAULT_TRADING_MARKET_TYPE = TradingMarketType.UNKNOWN;