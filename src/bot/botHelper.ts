import { Telegraf } from 'telegraf';

let bot;

export const botHelper = {
  sendMsgToChannel: (msg) => {
    bot.telegram.sendMessage('@stock_patterns_guru', msg);
  },
  startBot: () => {
    bot = new Telegraf(process.env.BOT_TOKEN);
    bot.start((ctx) => ctx.reply('Welcome'));

    bot.hears('animals', (ctx) => {
      console.log(ctx.from);
      const animalMessage = `great, here are pictures of animals you would love`;
      ctx.deleteMessage();
      bot.telegram.sendMessage(ctx.chat.id, animalMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'dog',
                callback_data: 'dog',
              },
              {
                text: 'cat',
                callback_data: 'cat',
              },
            ],
          ],
        },
      });
    });

    //method that returns image of a dog

    bot.action('dog', (ctx) => {
      ctx.replyWithPhoto({
        url: 'https://picsum.photos/200/300/?random',
        filename: 'kitten.jpg',
      });
    });

    //method that returns image of a cat

    bot.action('cat', (ctx) => {
      ctx.replyWithPhoto({
        url: 'https://picsum.photos/200/300/?random',
        filename: 'kitten.jpg',
      });
    });
    bot.launch();
  },
  stop: (signal: string) => bot.stop(signal),
};

// export const
