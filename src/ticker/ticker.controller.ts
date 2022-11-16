import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';

@Controller('ticker')
export class TickerController {
  @Public()
  @Get('/moving-tape')
  async getTape() {
    return {
      data: [],
      success: true,
    };
  }
}
