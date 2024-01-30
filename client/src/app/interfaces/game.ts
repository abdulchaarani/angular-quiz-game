import { Question } from './question';

export interface Game {
    id: number;
    title: string;
    description: string;
    lastModification: Date;
    duration: number;
    isVisible?: boolean;
    questions: Question[];
}
