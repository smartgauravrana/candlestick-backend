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
  timeframe: number | '1D' | '1W' | '1M';
  symbols: string[];
}

export interface MacdOutput {
  MACD?: number;
  signal?: number;
  histogram?: number;
  timestamp: number;
  close: number;
  security: string;
  isBullish?: boolean;
}
