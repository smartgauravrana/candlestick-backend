import { Injectable } from '@nestjs/common';
import { MarketDataService } from 'src/common/services/market-data/market-data.service';

@Injectable()
export class TickerService {
  constructor(private marketDataService: MarketDataService) {}

  async getTapeData() {}
}
