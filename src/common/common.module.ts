import { Module } from '@nestjs/common';
import { MarketDataService } from './services/market-data/market-data.service';

@Module({
  providers: [MarketDataService],
  exports: [MarketDataService],
})
export class CommonModule {}
