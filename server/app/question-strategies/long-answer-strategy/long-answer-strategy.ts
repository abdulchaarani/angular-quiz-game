import { LongAnswer } from '@app/model/answer-types/long-answer/long-answer';
import { GradingEvents } from '@app/constants/grading-events';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { HISTOGRAM_UPDATE_TIME_MS, MULTIPLICATION_FACTOR } from '@common/constants/match-constants';
import { AnswerEvents } from '@common/events/answer.events';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionStrategy } from '@app/question-strategies/question-strategy';
import { GradesHistogram, PlayerCountHistogram } from '@common/interfaces/histogram';
import { GradeTracker } from '@app/model/choice-tracker/choice-tracker';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { isInt } from 'class-validator';
import { Grade } from '@common/interfaces/choice-tally';

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
        const gradeTracker = new GradeTracker(matchRoom.currentQuestion.text, this.getPossibleGrades());
        grades.forEach((grade) => {
            const score = parseInt(grade.score, 10);
            gradeTracker.incrementCount(grade.score);

            const currentPlayer = players.find((player) => player.username === grade.username);
            currentPlayer.answerCorrectness = score;
            currentPlayer.score += currentQuestionPoints * (score / MULTIPLICATION_FACTOR);
        });
        this.buildGradesHistogram(matchRoom, gradeTracker);
        this.eventEmitter.emit(GradingEvents.GradingComplete, matchRoom.code);
    }

    buildHistogram(matchRoom: MatchRoom): PlayerCountHistogram {
        return this.buildPlayerCountHistogram(matchRoom);
    }

    buildPlayerCountHistogram(matchRoom: MatchRoom): PlayerCountHistogram {
        const players = matchRoom.players;
        const time = Date.now() - HISTOGRAM_UPDATE_TIME_MS;

        const emptyHistogram = {
            question: matchRoom.currentQuestion.text,
            type: 'QRL',
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

    private buildGradesHistogram(matchRoom: MatchRoom, gradeTracker: GradeTracker): void {
        const gradesHistogram: GradesHistogram = { question: gradeTracker.question, type: 'QRL', gradeTallies: Object.values(gradeTracker.items) };
        matchRoom.matchHistograms[matchRoom.currentQuestionIndex] = gradesHistogram;
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
            const score = '0';
            const longAnswerInfo: LongAnswerInfo = { username, answer, score };
            player.socket.emit(AnswerEvents.TimesUp);
            return longAnswerInfo;
        });
        matchRoom.hostSocket.emit(AnswerEvents.GradeAnswers, playerAnswers);
    }

    private getPossibleGrades() {
        const possibleGrades: Grade[] = [];
        Object.values(AnswerCorrectness).filter((value) => {
            if (isInt(value)) possibleGrades.push({ score: String(value) });
        });
        return possibleGrades;
    }
}
