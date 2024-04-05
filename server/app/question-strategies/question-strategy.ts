import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { Histogram } from '@common/interfaces/histogram';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
export abstract class QuestionStrategy {
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    abstract gradeAnswers(matchRoom: MatchRoom, players: Player[]): void;
    abstract calculateScore(matchRoom: MatchRoom, players: Player[], grades?: LongAnswerInfo[]): void;
    abstract buildHistogram(matchRoom: MatchRoom, choice?: string, selection?: boolean): Histogram;
}
