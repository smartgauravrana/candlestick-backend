import { Injectable } from '@nestjs/common';
import * as candlestick from 'candlestick';
import { connect, getCandles } from 'tradingview-ws';
import { NseIndia } from 'stock-nse-india';
import { AVAILABLE_CANDLESTICK_PATTERNS, SECURITY_SYMBOLS } from './constants';
import * as dayjs from 'dayjs';
import { SmartAPI, WebSocket } from 'smartapi-javascript';
import * as getToken from 'totp-generator';

import * as TradingView from '@mathieuc/tradingview';
import redis from 'src/utils/redisHelper';
import { botHelper } from 'src/bot/botHelper';
import { prepareNotifyMsg } from 'src/utils';

// let smart_api = new SmartAPI({
//   api_key: 'C9QmpRTC', // PROVIDE YOUR API KEY HERE
// OPTIONAL : If user has valid access token and refresh token then it can be directly passed to the constructor.
// access_token: "YOUR_ACCESS_TOKEN",
// refresh_token: "YOUR_REFRESH_TOKEN"
// });

// console.log('smart: ', smart_api);
// const totp = getToken('FEDK4NL44DPFY7LWSJXKQNA5E4');

// smart_api
//   .generateSession('client', 'password', totp)
//   .then((data) => {
//     return smart_api.getProfile();
//   })
//   .then((data) => {
//     // Profile details
//   })
//   .catch((ex) => {
//     //Log error
//     console.log('error: ', ex);
//   });

@Injectable()
export class PatternsService {
  async processPatterns() {
    const self = this;
    // const data = await smart_api.getCandleData({
    //   exchange: 'NSE',
    //   symboltoken: 'TCS',
    //   interval: 'ONE_MINUTE',
    //   fromdate: '2021-02-10 09:15',
    //   todate: '2021-02-10 09:16',
    // });

    // console.log('data: ', data);
    // TradingView.loginUser('ludokhelo99@gmail.com', 'Vodafone8053#', false)
    //   .then((user) => {
    //     console.log('User:', user);
    //     console.log('Sessionid:', user.session);
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
      await connection.close();
      const patterns = self.findPatterns(candles);
      botHelper.sendMsgToChannel(prepareNotifyMsg(patterns));
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
              time: dayjs.unix(item.timestamp).format('DD/MM/YYYY HH:mm:ss A'),
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
