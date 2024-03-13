import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Message } from '@app/model/schema/message.schema';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { MOCK_MATCH_ROOM } from '@app/constants/match-mocks';

describe('ChatService', () => {
    let service: ChatService;
    let matchRoomService: MatchRoomService;
    let mockMatchRooms: MatchRoom[];

    beforeEach(async () => {
        mockMatchRooms = [{ ...MOCK_MATCH_ROOM, messages: [] }];

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: MatchRoomService,
                    useValue: {
                        getRoomIndexByCode: jest.fn(),
                        matchRooms: mockMatchRooms,
                    },
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        matchRoomService = module.get<MatchRoomService>(MatchRoomService);
    });

    // Add these to the constants file
    const roomCode = MOCK_MATCH_ROOM.code;
    const mockMessage: Message = { text: 'Test Text', author: 'User', date: new Date() };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should add and get messages', () => {
        const roomCode = '1234';
        const message: Message = { text: 'Test Text', author: 'User', date: new Date() };
        const mockMatchRoom = [MOCK_MATCH_ROOM];

        jest.spyOn(matchRoomService, 'getRoomIndexByCode').mockReturnValue(0);
        service.addMessage(message, MOCK_MATCH_ROOM.code);
        const messages = service.getMessages(roomCode);
        expect(messages).toEqual([message]);
        const returnedMessage = service.addMessage(message, roomCode);

        expect(returnedMessage).toEqual(message);
    });

    it('should not add a message to a match room that does not exist', () => {
        jest.spyOn(matchRoomService, 'getRoomIndexByCode').mockReturnValue(-1);
        service.addMessage(mockMessage, roomCode);
        const messages = service.getMessages(roomCode);
        expect(messages).toEqual([]);
    });

    it('should return the added message', () => {
        jest.spyOn(matchRoomService, 'getRoomIndexByCode').mockReturnValue(0);
        const returnedMessage = service.addMessage(mockMessage, roomCode);
        expect(returnedMessage).toEqual(mockMessage);
    });
});
