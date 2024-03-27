import { LongAnswer } from '@app/answer/answer';
import { GradingEvents } from '@app/constants/grading-events';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { HISTOGRAM_UPDATE_TIME_MS, MULTIPLICATION_FACTOR } from '@common/constants/match-constants';
import { AnswerEvents } from '@common/events/answer.events';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionStrategy } from '@app/question-strategies/question-strategy';
import { PlayerCountHistogram } from '@common/interfaces/histogram';

@Injectable()
export class LongAnswerStrategy extends QuestionStrategy {
    constructor(private readonly eventEmitter: EventEmitter2) {
        super('QRL');
    }

    gradeAnswers(matchRoom: MatchRoom, players: Player[]): void {
        this.prepareAnswersForGrading(matchRoom, players);
    }

    calculateScore(matchRoom: MatchRoom, players: Player[], grades: LongAnswerInfo[]) {
        const currentQuestionPoints = matchRoom.currentQuestion.points;
        const gradeTally: Map<number, number> = new Map();
        grades.forEach((grade) => {
            const score = parseInt(grade.score, 10);
            gradeTally.set(score, gradeTally.get(score) + 1);

            const currentPlayer = players.find((player) => player.username === grade.username);
            currentPlayer.answerCorrectness = score;
            currentPlayer.score += currentQuestionPoints * (score / MULTIPLICATION_FACTOR);
        });
        this.eventEmitter.emit(GradingEvents.GradingComplete, matchRoom.code);
    }

    buildHistogram(matchRoom: MatchRoom): PlayerCountHistogram {
        const players = matchRoom.players;
        const time = Date.now() - HISTOGRAM_UPDATE_TIME_MS;

        const emptyHistogram = {
            question: matchRoom.currentQuestion.text,
            playerCount: 0,
            activePlayers: 0,
            inactivePlayers: 0,
        };

        const longAnswerHistogram = players.reduce((currentHistogram: PlayerCountHistogram, player) => {
            if (player.isPlaying) currentHistogram.playerCount++;
            if (player.answer.timestamp >= time) currentHistogram.activePlayers++;
            return currentHistogram;
        }, emptyHistogram);

        longAnswerHistogram.inactivePlayers = longAnswerHistogram.playerCount - longAnswerHistogram.activePlayers;
        return longAnswerHistogram;
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
