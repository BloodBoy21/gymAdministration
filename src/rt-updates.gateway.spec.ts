import { Test, TestingModule } from '@nestjs/testing';
import { RtUpdatesGateway } from './rt-updates.gateway';

describe('RtUpdatesGateway', () => {
  let gateway: RtUpdatesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RtUpdatesGateway],
    }).compile();

    gateway = module.get<RtUpdatesGateway>(RtUpdatesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
