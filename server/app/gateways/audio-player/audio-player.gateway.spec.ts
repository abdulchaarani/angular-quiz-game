import { Test, TestingModule } from '@nestjs/testing';
import { AudioPlayerGateway } from './audio-player.gateway';

describe('AudioGateway', () => {
    let gateway: AudioPlayerGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AudioPlayerGateway],
        }).compile();

        gateway = module.get<AudioPlayerGateway>(AudioPlayerGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
