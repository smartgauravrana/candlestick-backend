import { Injectable } from '@nestjs/common';
import * as candlestick from 'candlestick';
import { connect, getCandles } from 'tradingview-ws';
import { NseIndia } from 'stock-nse-india';
import { AVAILABLE_CANDLESTICK_PATTERNS, SECURITY_SYMBOLS } from './constants';
import * as dayjs from 'dayjs';
import { SmartAPI, WebSocket } from 'smartapi-javascript';
import * as getToken from 'totp-generator';
import { Cron } from '@nestjs/schedule';

import * as TradingView from '@mathieuc/tradingview';
import redis from 'src/utils/redisHelper';
import { botHelper } from 'src/bot/botHelper';
import { prepareNotifyMsg } from 'src/utils';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'Asia/Kolkata';
const getMsgSendKey = (security: string, ts: string | number): string => {
  return security + '#' + ts;
};

@Injectable()
export class PatternsService {
  @Cron('3 */2 * * * *')
  async processPatterns() {
    const self = this;

    const sessionId = await redis.get('TRADINGVIEW_SESSION');
    (async function () {
      const connection = await connect({
        sessionId,
      });
      const candles = await getCandles({
        connection,
        symbols: SECURITY_SYMBOLS,
        amount: 20,
        timeframe: 15,
      });
      // console.log('candles: ', candles[0]);
      await connection.close();
      const patterns = self.findPatterns(candles);
      const hash = await redis.hgetall('MSG_SEND');
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
        await redis.hset('MSG_SEND', updateObj);
      }
    })();
    //   })
    //   .catch((err) => {
    //     console.error('Login error:', err.message);
    //   });
  }

  findPatterns(candles: any[]) {
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
    // console.log('results: ', results);
    return results;
  }
}
