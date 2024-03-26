import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';

export interface QuestionStrategy {
    gradeAnswers(matchRoom: MatchRoom, players: Player[]): void;
    calculateScore(matchRoom: MatchRoom, players: Player[], grades?: LongAnswerInfo[]): void;
}
