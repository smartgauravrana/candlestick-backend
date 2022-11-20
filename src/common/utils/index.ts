import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { MacdOutput } from '../interfaces/market-data';

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'Asia/Kolkata';

function sliceMsg(messageString) {
  const max_size = 4096;

  const amount_sliced = messageString.length / max_size;
  let start = 0;
  let end = max_size;
  let message;
  const messages = [];
  for (let i = 0; i < amount_sliced; i++) {
    message = messageString.slice(start, end);
    messages.push(message);
    start = start + max_size;
    end = end + max_size;
  }

  return messages;
}

const defaultMsgFormatter = (info) => {
  return `
  ${info.security.replace('NSE:', '')} 
  pattern: ${info.pattern}
  time: ${info.time}
  `;
};

export const macdMsgFormatter = (info: MacdOutput) => {
  return `
  ${info.isBullish ? '✅' : '🛑'}${info.security.replace('NSE:', '')} 
  indicator: MACD
  time: ${dayjs.unix(info.timestamp).tz(tz).format('D MMMM YYYY, h:mm:ss a')}
  `;
};

export const prepareNotifyMsg = (
  records = [],
  msgFormatter = defaultMsgFormatter,
) => {
  const msg = records.reduce((acc, curr, idx) => {
    const newMsg = msgFormatter(curr);

    acc += newMsg;
    return acc;
  }, '');

  //   console.log('msg: ', msg);
  return sliceMsg(msg);
};

export const getMsgSendKey = (
  security: string,
  ts: string | number,
): string => {
  return security + '#' + ts;
};
