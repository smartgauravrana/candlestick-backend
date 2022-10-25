import { Module } from '@nestjs/common';
import { PatternsController } from './patterns.controller';
import { PatternsService } from './patterns.service';

@Module({
  controllers: [PatternsController],
  providers: [PatternsService],
})
export class PatternsModule {}
