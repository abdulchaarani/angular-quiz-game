import { ChoiceTally } from './choice-tally';

export interface Histogram {
    question: string;
    choiceTallies: ChoiceTally[];
}
