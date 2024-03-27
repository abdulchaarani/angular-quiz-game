import { ChoiceTally } from './choice-tally';

export interface Histogram {
    question: string;
}

export interface MultipleChoiceHistogram extends Histogram {
    choiceTallies: ChoiceTally[];
}
export interface LongAnswerHistogram extends Histogram {
    playerCount: number;
    activePlayers: number;
    inactivePlayers: number;
}
