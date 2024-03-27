import { Choice } from './choice';

export interface Tally {
    tally: number;
}
export interface ChoiceTally extends Choice, Tally {}

export interface GradeTally extends Tally {}
