export interface MarketData {
  open: number;
  timestamp: number;
  high: number;
  close: number;
  low: number;
  security?: string;
  pattern?: string;
}

export interface GetMarketDataConfig {
  amount: number;
  timeframe: number;
}
