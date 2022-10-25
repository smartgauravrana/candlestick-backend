import { Test, TestingModule } from '@nestjs/testing';
import { PatternsController } from './patterns.controller';

describe('PatternsController', () => {
  let controller: PatternsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatternsController],
    }).compile();

    controller = module.get<PatternsController>(PatternsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
