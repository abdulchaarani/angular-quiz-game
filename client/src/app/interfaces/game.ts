export interface Game {
    id: number;
    title: string;
    description: string;
    lastModification: Date;
    duration: number;
    isVisible: boolean;
    // TODO: Add List of Questions (requires interface Question)
}
