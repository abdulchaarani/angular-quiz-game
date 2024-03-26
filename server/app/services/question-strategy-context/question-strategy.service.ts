import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { LongAnswerStrategy } from '@app/question-strategies/long-answer-strategy/long-answer-strategy';
import { MultipleChoiceStrategy } from '@app/question-strategies/multiple-choice-strategy/multiple-choice-strategy';
import { Strategy } from '@app/question-strategies/strategy';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionStrategyContext {
    private questionStrategy: Strategy;

    constructor(
        private readonly multipleChoiceStrategy: MultipleChoiceStrategy,
        private readonly longAnswerStrategy: LongAnswerStrategy,
    ) {
        this.setMultipleChoiceStrategy();
    }

    setMultipleChoiceStrategy() {
        this.questionStrategy = this.multipleChoiceStrategy;
    }

    setLongAnswerStrategy() {
        this.questionStrategy = this.longAnswerStrategy;
    }

    gradeAnswers(matchRoom: MatchRoom, players: Player[]) {
        this.questionStrategy.gradeAnswers(matchRoom, players);
    }

    calculateScore(matchRoom: MatchRoom, players: Player[], grades?: LongAnswerInfo[]) {
        this.questionStrategy.calculateScore(matchRoom, players, grades);
    }
}
