import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { PatternsController } from './patterns.controller';
import { PatternsService } from './patterns.service';

@Module({
  imports: [CommonModule],
  controllers: [PatternsController],
  providers: [PatternsService],
})
export class PatternsModule {}
