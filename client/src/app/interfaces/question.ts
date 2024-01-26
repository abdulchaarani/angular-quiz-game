import { Choice } from './choice';

export interface Question {
    type: string;
    description: string;
    question: string;
    points: number;
    choices?: Choice[];
    lastModification: string; // shouldnt it be a date
}
