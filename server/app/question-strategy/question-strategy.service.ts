import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { LongAnswerStrategy, MultipleChoiceStrategy, Strategy } from '@app/strategy/strategy';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionStrategyService {
    private strategy: Strategy;

    constructor(
        private readonly multipleChoiceStrategy: MultipleChoiceStrategy,
        private readonly longAnswerStrategy: LongAnswerStrategy,
    ) {
        this.setMultipleChoiceStrategy();
    }

    setMultipleChoiceStrategy() {
        this.strategy = this.multipleChoiceStrategy;
    }

    setLongAnswerStrategy() {
        this.strategy = this.longAnswerStrategy;
    }

    gradeAnswers(matchRoom: MatchRoom, players: Player[]) {
        this.strategy.gradeAnswers(matchRoom, players);
    }

    calculateScore(matchRoom: MatchRoom, players: Player[], grades?: LongAnswerInfo[]) {
        this.strategy.calculateScore(matchRoom, players, grades);
    }
}
