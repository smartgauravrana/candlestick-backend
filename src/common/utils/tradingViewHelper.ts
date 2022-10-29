import * as TradingView from '@mathieuc/tradingview';
import redis from './redisHelper';

export const loginTradingView = async () => {
  console.log('env: ', process.env.TRADINGVIEW_EMAIL);
  const sessionId = await redis.get('TRADINGVIEW_SESSION');
  console.log('TRDAINGVIEW_SESION_ID: ', sessionId);
  if (!sessionId) {
    TradingView.loginUser(
      process.env.TRADINGVIEW_EMAIL,
      process.env.TRADINGVIEW_PASSWORD,
      false,
    )
      .then((user) => {
        console.log('User:', user);
        console.log('Sessionid:', user.session);
        redis.set('TRADINGVIEW_SESSION', user.session);
      })
      .catch((err) => {
        console.error('Login error:', err.message);
      });
  }
};
