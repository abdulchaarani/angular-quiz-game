import { ChoiceTally } from '@app/model/choice-tally/choice-tally';
import { Choice } from '@app/model/database/choice';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { TimeService } from '@app/services/time/time.service';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

const FACTOR = 9000;
const MAXIMUM_CODE_LENGTH = 4;
const COUNTDOWN_TIME = 5;

@Injectable()
export class MatchRoomService {
    matchRooms: MatchRoom[];

    constructor(private timeService: TimeService) {
        this.matchRooms = [];
    }

    generateRoomCode(): string {
        let generatedCode: string;
        while (!generatedCode || this.getMatchRoomByCode(generatedCode)) {
            generatedCode = Math.floor(Math.random() * FACTOR).toString();
        }
        while (generatedCode.length < MAXIMUM_CODE_LENGTH) {
            generatedCode = '0' + generatedCode;
        }
        return generatedCode;
    }

    getMatchRoomByCode(code: string): MatchRoom | undefined {
        return this.matchRooms.find((room: MatchRoom) => {
            return room.code === code;
        });
    }

    getRoomIndexByCode(code: string): number {
        return this.matchRooms.findIndex((room: MatchRoom) => {
            return room.code === code;
        });
    }

    addMatchRoom(selectedGame: Game, socket: Socket): MatchRoom {
        const newRoom: MatchRoom = {
            code: this.generateRoomCode(),
            hostSocket: socket,
            isLocked: false,
            isPlaying: false,
            game: selectedGame,
            gameLength: selectedGame.questions.length,
            currentQuestionIndex: 0,
            currentQuestionAnswer: [],
            choiceTally: new ChoiceTally(),
            bannedUsernames: [],
            players: [],
            messages: [],
        };
        this.matchRooms.push(newRoom);
        return newRoom;
    }

    getRoomCodeByHostSocket(socketId: string): string {
        let matchRoomCode: string;
        this.matchRooms.forEach((matchRoom: MatchRoom) => {
            matchRoomCode = matchRoom.hostSocket.id === socketId ? matchRoom.code : undefined;
        });
        return matchRoomCode;
    }

    toggleLockMatchRoom(matchRoomCode: string): void {
        this.getMatchRoomByCode(matchRoomCode).isLocked = !this.getMatchRoomByCode(matchRoomCode).isLocked;
    }

    deleteMatchRoom(matchRoomCode: string): void {
        this.matchRooms = this.matchRooms.filter((room: MatchRoom) => {
            return room.code !== matchRoomCode;
        });
    }

    isValidMatchRoomCode(matchRoomCode: string): boolean {
        const room = this.getMatchRoomByCode(matchRoomCode);
        if (!room) {
            return false;
        }
        return !room.isLocked;
    }

    startMatch(server: Server, matchRoomCode: string) {
        if (!this.canStartMatch(matchRoomCode)) return;
        this.timeService.startTimer(matchRoomCode, COUNTDOWN_TIME, server);
    }

    markGameAsPlaying(matchRoomCode: string): void {
        const matchRoom: MatchRoom = this.getMatchRoomByCode(matchRoomCode);
        matchRoom.isPlaying = true;
    }

    isGamePlaying(matchRoomCode: string): boolean {
        return this.getMatchRoomByCode(matchRoomCode).isPlaying;
    }
    sendFirstQuestion(server: Server, matchRoomCode: string): void {
        const matchRoom: MatchRoom = this.getMatchRoomByCode(matchRoomCode);
        const firstQuestion = matchRoom.game.questions[0];
        const gameDuration: number = matchRoom.game.duration;
        server.in(matchRoomCode).emit('beginQuiz', { firstQuestion: firstQuestion, gameDuration: gameDuration });
    }

    sendNextQuestion(server: Server, matchRoomCode: string): void {
        const matchRoom: MatchRoom = this.getMatchRoomByCode(matchRoomCode);

        if (matchRoom.currentQuestionIndex === matchRoom.gameLength) {
            server.in(matchRoomCode).emit('gameOver');
            return;
        }

        this.resetChoiceTally(matchRoomCode);
        const nextQuestion = matchRoom.game.questions[matchRoom.currentQuestionIndex++];
        this.filterCorrectChoices(nextQuestion, matchRoom.currentQuestionAnswer);
        this.removeIsCorrectField(nextQuestion);
        server.in(matchRoomCode).emit('nextQuestion', nextQuestion);
        this.timeService.startTimer(matchRoomCode, this.getGameDuration(matchRoomCode), server);
    }

    updateChoiceTally(roomCode: string, choice: string, selection: boolean) {
        const matchRoom = this.getMatchRoomByCode(roomCode);
        if (selection) matchRoom.choiceTally.incrementCount(choice);
        else matchRoom.choiceTally.decrementCount(choice);
    }

    canStartMatch(matchRoomCode: string): boolean {
        const room = this.getMatchRoomByCode(matchRoomCode);
        if (!room) {
            return false;
        }
        return room.isLocked && room.players.length > 0;
    }

    getGameTitle(matchRoomCode: string): string {
        return this.getMatchRoomByCode(matchRoomCode).game.title;
    }

    private resetChoiceTally(matchRoomCode: string) {
        const matchRoom = this.getMatchRoomByCode(matchRoomCode);
        const possibleChoices: Choice[] = matchRoom.game.questions[matchRoom.currentQuestionIndex].choices;
        matchRoom.choiceTally.resetChoiceTally(possibleChoices);
    }

    private filterCorrectChoices(question: Question, correctChoices: string[]) {
        question.choices.forEach((choice) => {
            if (choice.isCorrect) {
                correctChoices.push(choice.text);
            }
        });
    }

    private removeIsCorrectField(question: Question): void {
        question.choices.forEach((choice: Choice) => delete choice.isCorrect);
    }

    getGameDuration(matchRoomCode: string) {
        return this.getMatchRoomByCode(matchRoomCode).game.duration;
    }
}
