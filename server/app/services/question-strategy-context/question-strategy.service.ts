import { LongAnswer, MultipleChoiceAnswer } from '@app/answer/answer';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { LongAnswerStrategy } from '@app/question-strategies/long-answer-strategy/long-answer-strategy';
import { MultipleChoiceStrategy } from '@app/question-strategies/multiple-choice-strategy/multiple-choice-strategy';
import { QuestionStrategy } from '@app/question-strategies/question-strategy';
import { LONG_ANSWER_TIME } from '@common/constants/match-constants';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionStrategyContext {
    private questionStrategy: QuestionStrategy;

    constructor(
        private readonly multipleChoiceStrategy: MultipleChoiceStrategy,
        private readonly longAnswerStrategy: LongAnswerStrategy,
    ) {
        this.setMultipleChoiceStrategy();
    }

    getQuestionStrategy(): string {
        return this.questionStrategy.type;
    }

    setQuestionStrategy(matchRoom: MatchRoom) {
        const currentQuestionType = matchRoom.currentQuestion.type;

        switch (currentQuestionType) {
            case 'QCM':
                this.setMultipleChoiceStrategy();
                matchRoom.players.forEach((player) => (player.answer = new MultipleChoiceAnswer()));
                matchRoom.questionDuration = matchRoom.game.duration;
                break;

            case 'QRL':
                this.setLongAnswerStrategy();
                matchRoom.players.forEach((player) => (player.answer = new LongAnswer()));
                matchRoom.questionDuration = LONG_ANSWER_TIME;
                break;
        }
    }

    gradeAnswers(matchRoom: MatchRoom, players: Player[]) {
        this.questionStrategy.gradeAnswers(matchRoom, players);
    }

    calculateScore(matchRoom: MatchRoom, players: Player[], grades?: LongAnswerInfo[]) {
        this.questionStrategy.calculateScore(matchRoom, players, grades);
    }

    // permit any type of args to allow method overloading in concrete classes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateHistogram(...args: any): void {
        this.questionStrategy.updateHistogram(args);
    }

    private setMultipleChoiceStrategy() {
        this.questionStrategy = this.multipleChoiceStrategy;
    }

    private setLongAnswerStrategy() {
        this.questionStrategy = this.longAnswerStrategy;
    }
}
