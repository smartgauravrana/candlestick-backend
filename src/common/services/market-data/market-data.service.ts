import { Injectable } from '@nestjs/common';
import { MarketData } from '../../interfaces/market-data';
import { connect, getCandles } from 'tradingview-ws';
import redis from 'src/common/utils/redisHelper';
import { REDIS_KEYS, SECURITY_SYMBOLS } from '../../constants';

@Injectable()
export class MarketDataService {
  async getDataByTimeFrame(): Promise<MarketData[][]> {
    const sessionId = await redis.get(REDIS_KEYS.tradingViewSessionId);
    const connection = await connect({
      sessionId,
    });
    const candles = await getCandles({
      connection,
      symbols: SECURITY_SYMBOLS,
      amount: 20,
      timeframe: 60,
    });
    await connection.close();
    return candles;
  }
}
