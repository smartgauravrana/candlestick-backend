import { Telegraf } from 'telegraf';

let bot: Telegraf;

export const botHelper = {
  sendMsgToChannel: (msg) => {
    return bot.telegram.sendMessage('@stock_patterns_guru', msg);
  },
  startBot: () => {
    bot = new Telegraf(process.env.BOT_TOKEN);
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.launch();
  },
  stop: (signal: string) => bot.stop(signal),
};

// export const
