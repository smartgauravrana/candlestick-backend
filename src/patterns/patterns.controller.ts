import { Controller, Get } from '@nestjs/common';
import { PatternsService } from './patterns.service';

@Controller('patterns')
export class PatternsController {
  constructor(private patternService: PatternsService) {}
  @Get()
  getPatterns(): string {
    this.patternService.processPatterns();
    return 'HELLO';
  }
}
