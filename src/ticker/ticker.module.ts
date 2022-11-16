import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { MarketDataService } from 'src/common/services/market-data/market-data.service';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

@Module({
  imports: [CommonModule],
  controllers: [TickerController],
  providers: [TickerService],
})
export class TickerModule {}
