import { Choice } from './choice';

export interface Question {
    id?: string;
    type: string;
    text: string;
    points: number;
    choices?: Choice[];
    lastModification: string;
}
