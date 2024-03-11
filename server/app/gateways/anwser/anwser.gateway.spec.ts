import { Test, TestingModule } from '@nestjs/testing';
import { AnwserGateway } from './anwser.gateway';
import { AnswerService } from '@app/services/answer/answer.service';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { MOCK_ROOM_CODE } from '@app/constants/match-mocks';
import { ChoiceInfo } from '@app/model/schema/answer.schema';

describe('AnwserGateway', () => {
    let gateway: AnwserGateway;
    let answerServiceSpy: SinonStubbedInstance<AnswerService>;
    let server: SinonStubbedInstance<Server>;
    let socket: SinonStubbedInstance<Socket>;
    let choice: ChoiceInfo;
    beforeEach(async () => {
        answerServiceSpy = createStubInstance(AnswerService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [AnwserGateway, { provide: AnswerService, useValue: answerServiceSpy }],
        }).compile();

        gateway = module.get<AnwserGateway>(AnwserGateway);
        gateway['server'] = server;

        choice = { choice: 'choice', userInfo: { roomCode: MOCK_ROOM_CODE, username: 'player1' } };
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('selectChoice() should delegate selection of choice to answer service', () => {
        const updateChoiceSpy = jest.spyOn(answerServiceSpy, 'updateChoice').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_ROOM_CODE]));
        gateway.selectChoice(socket, choice);
        expect(updateChoiceSpy).toHaveBeenCalledWith(choice.choice, true, choice.userInfo.username, choice.userInfo.roomCode);
    });

    it('deselectChoice() should delegate deselection of choice to answer service', () => {
        const updateChoiceSpy = jest.spyOn(answerServiceSpy, 'updateChoice').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_ROOM_CODE]));
        gateway.deselectChoice(socket, choice);
        expect(updateChoiceSpy).toHaveBeenCalledWith(choice.choice, false, choice.userInfo.username, choice.userInfo.roomCode);
    });

    it('submitAnswer() should delegate submitting of answer to answer service', () => {
        const submitAnswerSpy = jest.spyOn(answerServiceSpy, 'submitAnswer').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_ROOM_CODE]));
        gateway.submitAnswer(socket, choice.userInfo);
        expect(submitAnswerSpy).toHaveBeenCalledWith(choice.userInfo.username, choice.userInfo.roomCode);
    });
});
