import { Injectable } from '@nestjs/common';
import * as candlestick from 'candlestick';
import * as dayjs from 'dayjs';
import redis from 'src/common/utils/redisHelper';
import { botHelper } from 'src/bot/botHelper';
import { getMsgSendKey, prepareNotifyMsg } from 'src/common/utils';
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

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'Asia/Kolkata';

@Injectable()
export class PatternsService {
  constructor(private marketDataService: MarketDataService) {}
  @Cron('3 */2 * * * *')
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
