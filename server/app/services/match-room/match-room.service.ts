import { TimerEvents } from '@app/constants/timer-events';
import { ChoiceTally } from '@app/model/choice-tally/choice-tally';
import { Choice } from '@app/model/database/choice';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { TimeService } from '@app/services/time/time.service';
import { COOLDOWN_TIME, COUNTDOWN_TIME, FACTOR, MAXIMUM_CODE_LENGTH } from '@common/constants/match-constants';
import { GameInfo } from '@common/interfaces/game-info';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

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
            activePlayers: 0,
            submittedPlayers: 0,
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

    startMatch(socket: Socket, server: Server, matchRoomCode: string) {
        if (!this.canStartMatch(matchRoomCode)) return;
        const gameTitle = this.getGameTitle(matchRoomCode);
        const gameInfo: GameInfo = { start: true, gameTitle };
        socket.to(matchRoomCode).emit('matchStarting', gameInfo);

        this.timeService.startTimer(server, matchRoomCode, COUNTDOWN_TIME, TimerEvents.CountdownTimerExpired);
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
        matchRoom.currentQuestionAnswer = this.filterCorrectChoices(firstQuestion);
        this.removeIsCorrectField(firstQuestion);
        matchRoom.hostSocket.send('currentAnswers', matchRoom.currentQuestionAnswer);
        server.in(matchRoomCode).emit('beginQuiz', { firstQuestion, gameDuration });
        this.timeService.startTimer(server, matchRoomCode, this.getGameDuration(matchRoomCode), TimerEvents.QuestionTimerExpired);
    }

    startNextQuestionCooldown(server: Server, matchRoomCode: string): void {
        server.in(matchRoomCode).emit('startCooldown', matchRoomCode);
        this.timeService.startTimer(server, matchRoomCode, COOLDOWN_TIME, TimerEvents.CooldownTimerExpired);
    }

    sendNextQuestion(server: Server, matchRoomCode: string): void {
        const matchRoom: MatchRoom = this.getMatchRoomByCode(matchRoomCode);
        if (matchRoom.currentQuestionIndex === matchRoom.gameLength) {
            server.in(matchRoomCode).emit('gameOver');
            return;
        }

        this.resetChoiceTally(matchRoomCode);
        const nextQuestion = matchRoom.game.questions[matchRoom.currentQuestionIndex];
        matchRoom.currentQuestionAnswer = this.filterCorrectChoices(nextQuestion);
        this.removeIsCorrectField(nextQuestion);
        server.in(matchRoomCode).emit('nextQuestion', nextQuestion);
        matchRoom.hostSocket.send('currentAnswers', matchRoom.currentQuestionAnswer);
        this.timeService.startTimer(server, matchRoomCode, this.getGameDuration(matchRoomCode), TimerEvents.QuestionTimerExpired);
    }

    incrementCurrentQuestionIndex(matchRoomCode: string) {
        this.getMatchRoomByCode(matchRoomCode).currentQuestionIndex++;
    }

    getGameTitle(matchRoomCode: string): string {
        return this.getMatchRoomByCode(matchRoomCode).game.title;
    }

    canStartMatch(matchRoomCode: string): boolean {
        const room = this.getMatchRoomByCode(matchRoomCode);
        if (!room) {
            return false;
        }
        return room.isLocked && room.players.length > 0;
    }

    getGameDuration(matchRoomCode: string) {
        return this.getMatchRoomByCode(matchRoomCode).game.duration;
    }

    private resetChoiceTally(matchRoomCode: string) {
        const matchRoom = this.getMatchRoomByCode(matchRoomCode);
        const possibleChoices: Choice[] = matchRoom.game.questions[matchRoom.currentQuestionIndex].choices;
        matchRoom.choiceTally.resetChoiceTally(possibleChoices);
    }

    private filterCorrectChoices(question: Question) {
        const correctChoices = [];
        question.choices.forEach((choice) => {
            if (choice.isCorrect) {
                correctChoices.push(choice.text);
            }
        });
        return correctChoices;
    }

    private removeIsCorrectField(question: Question) {
        question.choices.forEach((choice: Choice) => delete choice.isCorrect);
    }
}
