import { Test, TestingModule } from '@nestjs/testing';
import { PatternsService } from './patterns.service';

describe('PatternsService', () => {
  let service: PatternsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatternsService],
    }).compile();

    service = module.get<PatternsService>(PatternsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
