import { ChoiceTally } from './choice-tally';

export interface Histogram {
    question: string;
}

export interface MultipleChoiceHistogram extends Histogram {
    choiceTallies: ChoiceTally[];
}
export interface PlayerCountHistogram extends Histogram {
    playerCount: number;
    activePlayers: number;
    inactivePlayers: number;
}

export interface GradesHistogram extends Histogram {
    wrongAnswerCount: number;
    okAnswerCount: number;
    goodAnswerCount: number;
}
