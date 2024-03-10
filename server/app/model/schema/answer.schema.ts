// TODO: seperate in different folders?
export interface Answer {
    selectedChoices: Map<string, boolean>;
    isSubmited: boolean;
    timestamp?: number;
}
export interface UserInfo {
    roomCode: string;
    username: string;
}
export interface ChoiceInfo {
    userInfo: UserInfo;
    choice: string;
}
export interface Feedback {
    score: number;
    correctAnswer: string[];
}

export const emptyAnswer: Answer = {
    selectedChoices: new Map<string, boolean>(),
    isSubmited: false,
};
