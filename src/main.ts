import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { botHelper } from './bot/botHelper';
import { loginTradingView } from './utils/tradingViewHelper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);

  // init telegram bot
  botHelper.startBot();
  await loginTradingView();
}
bootstrap();

// Enable graceful stop
process.once('SIGINT', () => botHelper.stop('SIGINT'));
process.once('SIGTERM', () => botHelper.stop('SIGTERM'));
