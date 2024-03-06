export interface Answer {
    selectedChoices: Map<string, boolean>;
    isSubmited: boolean;
    timestamp?: number;
}

export const emptyAnswer: Answer = {
    selectedChoices: new Map<string, boolean>(),
    isSubmited: false,
};
