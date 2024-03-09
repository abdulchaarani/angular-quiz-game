import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PlayerRoomService } from '../player-room/player-room.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Message } from '@app/model/schema/message.schema';

describe('ChatService', () => {
    let service: ChatService;
    let matchRoomService: any;

    beforeEach(async () => {
        matchRoomService = { getMatchRoomByCode: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should add and get messages', () => {
        const roomCode = '1234';
        const message: Message = { text: 'Test Text', author: 'User', date: new Date() };
        matchRoomService.getMatchRoomByCode.mockReturnValue({ messages: [] });
        service.addMessage(message, roomCode);
        expect(service.getMessages(roomCode)).toEqual([message]);
    });

    it('should add and get messages', () => {
        const roomCode = '1234';
        const message: Message = { text: 'Test Text', author: 'User', date: new Date() };

        const mockMatchRoom = { messages: [] };
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);

        service.addMessage(message, roomCode);

        const messages = service.getMessages(roomCode);

        expect(messages).toEqual([message]);
    });
});
