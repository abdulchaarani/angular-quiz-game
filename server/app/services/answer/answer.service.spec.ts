import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from './answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { TimeService } from '@app/services/time/time.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MOCK_MATCH_ROOM, MOCK_ROOM_CODE } from '@app/constants/match-mocks';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';

describe('AnswerService', () => {
    let service: AnswerService;
    let matchRoomServiceSpy;
    let mockHostSocket;
    let matchRoomService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AnswerService, MatchRoomService, TimeService, PlayerRoomService, EventEmitter2],
        }).compile();

        service = module.get<AnswerService>(AnswerService);
        matchRoomService = module.get<TimeService>(MatchRoomService);
        matchRoomServiceSpy = jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(MOCK_MATCH_ROOM);

        mockHostSocket = {
            send: jest.fn(),
        };
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getMatchRoomByCode() should delegate call to match room service', () => {
        service['getMatchRoomByCode'](MOCK_ROOM_CODE);
        expect(matchRoomServiceSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('updateChoiceTally() increment the choice tally if the player selects the choice', () => {
        const choice = 'choice';
        const selection = true;
        service['updateChoiceTally'](choice, selection, MOCK_ROOM_CODE);
        expect(matchRoomServiceSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });
});
