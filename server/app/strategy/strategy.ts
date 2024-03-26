// eslint-disable-next-line max-classes-per-file
import { LongAnswer } from '@app/answer/answer';
import { GradingEvents } from '@app/constants/grading-events';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { BONUS_FACTOR, MULTIPLICATION_FACTOR } from '@common/constants/match-constants';
import { AnswerEvents } from '@common/events/answer.events';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface Strategy {
    gradeAnswers(matchRoom: MatchRoom, players: Player[]): void;
    calculateScore(matchRoom: MatchRoom, players: Player[], grades?: LongAnswerInfo[]): void;
}

@Injectable()
export class MultipleChoiceStrategy implements Strategy {
    constructor(private readonly eventEmitter: EventEmitter2) {}

    gradeAnswers(matchRoom: MatchRoom, players: Player[]): void {
        this.calculateScore(matchRoom, players);
        this.eventEmitter.emit(GradingEvents.GradingComplete, matchRoom.code);
    }

    calculateScore(matchRoom: MatchRoom, players: Player[]) {
        const currentQuestionPoints = matchRoom.currentQuestion.points;
        const correctPlayers: Player[] = [];
        let fastestTime: number;
        const correctAnswer: string[] = matchRoom.currentQuestionAnswer;
        players.forEach((player) => {
            if (player.answer.isCorrectAnswer(correctAnswer)) {
                player.answerCorrectness = AnswerCorrectness.GOOD;
                player.score += currentQuestionPoints;
                correctPlayers.push(player);
                if ((!fastestTime || player.answer.timestamp < fastestTime) && player.answer.timestamp !== Infinity)
                    fastestTime = player.answer.timestamp;
            }
        });

        if ((fastestTime && !matchRoom.isTestRoom) || matchRoom.isTestRoom)
            this.computeFastestPlayerBonus(currentQuestionPoints, fastestTime, correctPlayers);
    }

    private computeFastestPlayerBonus(points: number, fastestTime: number, correctPlayers: Player[]) {
        const fastestPlayers = correctPlayers.filter((player) => player.answer.timestamp === fastestTime);
        if (fastestPlayers.length !== 1) return;
        const fastestPlayer = fastestPlayers[0];
        const bonus = points * BONUS_FACTOR;
        fastestPlayer.score += bonus;
        fastestPlayer.bonusCount++;
        fastestPlayer.socket.emit(AnswerEvents.Bonus, bonus);
    }
}

@Injectable()
export class LongAnswerStrategy implements Strategy {
    constructor(private readonly eventEmitter: EventEmitter2) {}

    gradeAnswers(matchRoom: MatchRoom, players: Player[]): void {
        this.prepareAnswersForGrading(matchRoom, players);
    }

    calculateScore(matchRoom: MatchRoom, players: Player[], grades: LongAnswerInfo[]) {
        const currentQuestionPoints = matchRoom.currentQuestion.points;
        grades.forEach((grade) => {
            const score = parseInt(grade.score, 10);
            const currentPlayer = players.find((player) => player.username === grade.username);
            currentPlayer.answerCorrectness = score;
            currentPlayer.score += currentQuestionPoints * (score / MULTIPLICATION_FACTOR);
        });
        this.eventEmitter.emit(GradingEvents.GradingComplete, matchRoom.code);
    }

    private prepareAnswersForGrading(matchRoom: MatchRoom, players: Player[]) {
        if (matchRoom.isTestRoom) {
            const testAnswer: LongAnswerInfo[] = [{ username: players[0].username, answer: '', score: '100' }];
            this.calculateScore(matchRoom, players, testAnswer);
            return;
        }

        const playerAnswers = players.map((player: Player) => {
            const answer: string = (player.answer as LongAnswer).answer;
            const username: string = player.username;
            const longAnswerInfo: LongAnswerInfo = { username, answer };
            return longAnswerInfo;
        });

        matchRoom.hostSocket.emit(AnswerEvents.GradeAnswers, playerAnswers);
    }
}
