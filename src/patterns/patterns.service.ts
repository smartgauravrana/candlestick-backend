import { Injectable } from '@nestjs/common';
import * as candlestick from 'candlestick';
import * as dayjs from 'dayjs';
import redis from 'src/common/utils/redisHelper';
import { botHelper } from 'src/bot/botHelper';
import {
  getMsgSendKey,
  macdMsgFormatter,
  prepareNotifyMsg,
} from 'src/common/utils';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { MarketDataService } from 'src/common/services/market-data/market-data.service';
import { MarketData } from 'src/common/interfaces/market-data';
import {
  AVAILABLE_CANDLESTICK_PATTERNS,
  REDIS_KEYS,
  SECURITY_SYMBOLS,
} from 'src/common/constants';
import { Cron } from '@nestjs/schedule';
import * as Indicators from '@rylorin/technicalindicators';
import { Candle } from 'tradingview-ws';
import { STOCK_OPTIONS } from 'src/common/stocks.constants';
const { PromisePool } = require('@supercharge/promise-pool');

const MACD = Indicators.MACD;

// console.log('indi: ', Indicators.MA);

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'Asia/Kolkata';

const BATCH_SIZE = 10;

@Injectable()
export class PatternsService {
  constructor(private marketDataService: MarketDataService) {}

  // @Cron('3 */2 * * * *')
  async processPatterns() {
    const candles = await this.marketDataService.getDataByTimeFrame();
    const patterns = this.findPatterns(candles);
    const hash = await redis.hgetall(REDIS_KEYS.msgsSent);
    const updateObj = {};
    const filtered = patterns.filter((item) => {
      const key = getMsgSendKey(item.security, item.timestamp);
      if (hash[key]) {
        return false;
      } else {
        updateObj[key] = 1;
        return true;
      }
    });
    const msgs = prepareNotifyMsg(filtered);
    for (const msg of msgs) {
      await botHelper.sendMsgToChannel(msg);
    }
    if (Object.keys(updateObj).length > 0) {
      await redis.hset(REDIS_KEYS.msgsSent, updateObj);
    }
  }

  @Cron('3 */10 * * * *')
  async macd() {
    // bullish, macd line > signal
    const batches = [];
    for (let i = 0; i < Math.ceil(STOCK_OPTIONS.length / BATCH_SIZE); i++) {
      const sliceStart = i * BATCH_SIZE;
      batches.push(STOCK_OPTIONS.slice(sliceStart, sliceStart + BATCH_SIZE));
    }

    const { results, errors } = await PromisePool.withConcurrency(2)
      .for(batches)
      .process(async (batch, index, pool) => {
        const candles = await this.marketDataService.getDataByTimeFrame({
          amount: 100,
          timeframe: '1D',
          symbols: batch,
        });

        const results = this.processCandlesForMacd(candles);
        // console.log(results);

        return results;
      });

    const macdResults = results.flat(1);
    const hash = await redis.hgetall(REDIS_KEYS.MACD_SENT);
    const updateObj = {};
    const filtered = macdResults.filter((item) => {
      const key = getMsgSendKey(item.security, item.timestamp);
      if (hash[key]) {
        return false;
      } else {
        updateObj[key] = 1;
        return true;
      }
    });
    const msgs = prepareNotifyMsg(filtered, macdMsgFormatter);
    for (const msg of msgs) {
      await botHelper.sendMsgToChannel(msg);
    }
    if (Object.keys(updateObj).length > 0) {
      await redis.hset(REDIS_KEYS.MACD_SENT, updateObj);
    }
  }

  processCandlesForMacd(candles: MarketData[][]) {
    const results = [];
    candles.forEach((candle) => {
      const res = this.findMacd(candle);
      if (res) {
        results.push(res);
      }
    });
    return results;
  }

  findMacd(candle: MarketData[]) {
    const macdInput = {
      values: candle.map((candle) => candle.close),
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: true,
    };
    const macdOutput = MACD.calculate(macdInput);
    const macdData = candle
      .slice(25)
      .map((item, i) => ({
        timestamp: item.timestamp,
        close: item.close,
        security: item.security,
        ...macdOutput[i],
      }))
      .filter((item) => item.histogram && item.signal);

    // search for bullish
    let bullishTs = null;
    let idx = -1;
    for (let i = macdData.length - 1; i >= 0; i--) {
      const curr = macdData[i];
      if (curr.MACD > curr.signal) {
        bullishTs = curr.timestamp;
        idx = i;
      } else {
        break;
      }
    }
    if (bullishTs && idx > -1) {
      return macdData[idx];
    }
  }

  findPatterns(candles: MarketData[][]) {
    const results = [];

    for (const [idx, item] of candles.entries()) {
      for (const pattern of AVAILABLE_CANDLESTICK_PATTERNS) {
        const fn = candlestick[pattern];
        const res = fn(item);
        if (res.length) {
          const matched = res
            .filter((item) => item)
            .map((item) => ({
              ...item,
              security: SECURITY_SYMBOLS[idx],
              pattern,
              time: dayjs
                .unix(item.timestamp)
                .tz(tz)
                .format('DD/MM/YYYY hh:mm:ss A'),
            }));

          results.push(...matched);
        }
      }
    }

    results.sort(function (a, b) {
      return a.timestamp - b.timestamp;
    });
    return results;
  }
}
