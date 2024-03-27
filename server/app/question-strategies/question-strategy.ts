// permit any type of args to allow method overloading in concrete classes
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
export abstract class QuestionStrategy {
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    abstract gradeAnswers(matchRoom: MatchRoom, players: Player[]): void;
    abstract calculateScore(...args: any[]): void;
    abstract updateHistogram(...args: any[]): void;
}
