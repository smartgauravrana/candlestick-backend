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

export const prepareNotifyMsg = (records = []) => {
  const msg = records.reduce((acc, curr, idx) => {
    const newMsg = `
    ${curr.security.replace('NSE:', '')} 
    pattern: ${curr.pattern}
    time: ${curr.time}
    `;

    acc += newMsg;
    return acc;
  }, '');

  //   console.log('msg: ', msg);
  return sliceMsg(msg);
};
