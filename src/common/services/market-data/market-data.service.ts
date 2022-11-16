import { Injectable } from '@nestjs/common';
import { GetMarketDataConfig, MarketData } from '../../interfaces/market-data';
import { connect, getCandles } from 'tradingview-ws';
import redis from 'src/common/utils/redisHelper';
import { REDIS_KEYS, SECURITY_SYMBOLS } from '../../constants';

@Injectable()
export class MarketDataService {
  async getDataByTimeFrame(
    marketDataParams: GetMarketDataConfig = {
      amount: 20,
      timeframe: 15,
    },
  ): Promise<MarketData[][]> {
    const sessionId = await redis.get(REDIS_KEYS.tradingViewSessionId);
    const connection = await connect({
      sessionId,
    });
    const candles = await getCandles({
      connection,
      symbols: SECURITY_SYMBOLS,
      amount: marketDataParams.amount,
      timeframe: marketDataParams.timeframe,
    });
    await connection.close();
    return candles;
  }
}
