import { MatchEvents } from '@common/events/match.events';
import { INVALID_CODE, LOCKED_ROOM } from '@app/constants/match-login-errors';
import { ExpiredTimerEvents } from '@app/constants/expired-timer-events';
import { ChoiceTracker } from '@app/model/choice-tracker/choice-tracker';
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
    backgroundHostSocket: Socket;

    constructor(private readonly timeService: TimeService) {
        this.matchRooms = [];
    }

    generateRoomCode(): string {
        let generatedCode: string;
        while (!generatedCode || this.getRoom(generatedCode)) {
            generatedCode = Math.floor(Math.random() * FACTOR).toString();
        }
        while (generatedCode.length < MAXIMUM_CODE_LENGTH) {
            generatedCode = '0' + generatedCode;
        }
        return generatedCode;
    }

    getRoom(code: string): MatchRoom | undefined {
        return this.matchRooms.find((room: MatchRoom) => {
            return room.code === code;
        });
    }

    getRoomIndex(code: string): number {
        return this.matchRooms.findIndex((room: MatchRoom) => {
            return room.code === code;
        });
    }

    addRoom(selectedGame: Game, socket: Socket, isTestPage: boolean = false): MatchRoom {
        const newRoom: MatchRoom = {
            code: this.generateRoomCode(),
            hostSocket: socket,
            isLocked: isTestPage,
            isPlaying: isTestPage,
            game: selectedGame,
            gameLength: selectedGame.questions.length,
            currentQuestionIndex: 0,
            currentQuestionAnswer: [],
            currentChoiceTracker: new ChoiceTracker(),
            matchHistograms: [],
            bannedUsernames: [],
            players: [],
            activePlayers: 0,
            submittedPlayers: 0,
            messages: [],
            isTestRoom: isTestPage,
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

    toggleLock(matchRoomCode: string): void {
        this.getRoom(matchRoomCode).isLocked = !this.getRoom(matchRoomCode).isLocked;
    }

    deleteRoom(matchRoomCode: string): void {
        this.timeService.terminateTimer(matchRoomCode);
        this.matchRooms = this.matchRooms.filter((room: MatchRoom) => {
            return room.code !== matchRoomCode;
        });
    }

    getRoomCodeErrors(matchRoomCode: string): string {
        let errors = '';
        const room = this.getRoom(matchRoomCode);
        if (!room) {
            errors += INVALID_CODE;
        } else if (room.isLocked) {
            errors += LOCKED_ROOM;
        }
        return errors;
    }

    startMatch(socket: Socket, server: Server, matchRoomCode: string) {
        if (!this.canStartMatch(matchRoomCode)) return;
        const gameTitle = this.getGameTitle(matchRoomCode);
        const gameInfo: GameInfo = { start: true, gameTitle };
        socket.to(matchRoomCode).emit(MatchEvents.MatchStarting, gameInfo);

        this.timeService.startTimer(server, matchRoomCode, COUNTDOWN_TIME, ExpiredTimerEvents.CountdownTimerExpired);
    }

    markGameAsPlaying(matchRoomCode: string): void {
        const matchRoom: MatchRoom = this.getRoom(matchRoomCode);
        matchRoom.isPlaying = true;
    }

    isGamePlaying(matchRoomCode: string): boolean {
        return this.getRoom(matchRoomCode).isPlaying;
    }

    sendFirstQuestion(server: Server, matchRoomCode: string): void {
        const matchRoom: MatchRoom = this.getRoom(matchRoomCode);
        const firstQuestion = matchRoom.game.questions[0];
        const gameDuration: number = matchRoom.game.duration;
        const isTestRoom = matchRoom.isTestRoom;
        matchRoom.currentQuestionAnswer = this.filterCorrectChoices(firstQuestion);
        this.removeIsCorrectField(firstQuestion);
        if (!isTestRoom) {
            matchRoom.hostSocket.send(MatchEvents.CurrentAnswers, matchRoom.currentQuestionAnswer);
        }
        server.in(matchRoomCode).emit(MatchEvents.BeginQuiz, { firstQuestion, gameDuration, isTestRoom });
        this.timeService.startTimer(server, matchRoomCode, this.getGameDuration(matchRoomCode), ExpiredTimerEvents.QuestionTimerExpired);
    }

    startNextQuestionCooldown(server: Server, matchRoomCode: string): void {
        server.in(matchRoomCode).emit(MatchEvents.StartCooldown, matchRoomCode);
        this.timeService.startTimer(server, matchRoomCode, COOLDOWN_TIME, ExpiredTimerEvents.CooldownTimerExpired);
    }

    sendNextQuestion(server: Server, matchRoomCode: string): void {
        const matchRoom: MatchRoom = this.getRoom(matchRoomCode);
        if (matchRoom.currentQuestionIndex === matchRoom.gameLength) {
            server.in(matchRoomCode).emit(MatchEvents.GameOver, matchRoom.isTestRoom);
            return;
        }
        const nextQuestion = matchRoom.game.questions[matchRoom.currentQuestionIndex];
        matchRoom.currentQuestionAnswer = this.filterCorrectChoices(nextQuestion);
        this.removeIsCorrectField(nextQuestion);
        server.in(matchRoomCode).emit(MatchEvents.NextQuestion, nextQuestion);
        matchRoom.hostSocket.send(MatchEvents.CurrentAnswers, matchRoom.currentQuestionAnswer);
        this.timeService.startTimer(server, matchRoomCode, this.getGameDuration(matchRoomCode), ExpiredTimerEvents.QuestionTimerExpired);
    }

    incrementCurrentQuestionIndex(matchRoomCode: string) {
        this.getRoom(matchRoomCode).currentQuestionIndex++;
    }

    getGameTitle(matchRoomCode: string): string {
        return this.getRoom(matchRoomCode).game.title;
    }

    canStartMatch(matchRoomCode: string): boolean {
        const room = this.getRoom(matchRoomCode);
        if (!room) {
            return false;
        }
        return room.isLocked && room.players.length > 0;
    }

    getGameDuration(matchRoomCode: string) {
        return this.getRoom(matchRoomCode).game.duration;
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
