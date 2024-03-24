// import { Answer } from '@app/model/schema/answer.schema';
import { FreeAnswer, MultipleChoiceAnswer } from '@app/answer/answer';
import { Socket } from 'socket.io';

export interface Player {
    username: string;
    answer: MultipleChoiceAnswer | FreeAnswer;
    score: number;
    bonusCount: number;
    isPlaying: boolean;
    socket: Socket;
    state: string;
}
