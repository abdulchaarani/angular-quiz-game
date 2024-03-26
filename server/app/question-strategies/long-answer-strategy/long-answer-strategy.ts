import { LongAnswer } from '@app/answer/answer';
import { GradingEvents } from '@app/constants/grading-events';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { MULTIPLICATION_FACTOR } from '@common/constants/match-constants';
import { AnswerEvents } from '@common/events/answer.events';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuestionStrategy } from '@app/question-strategies/question-strategy';

@Injectable()
export class LongAnswerStrategy implements QuestionStrategy {
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
