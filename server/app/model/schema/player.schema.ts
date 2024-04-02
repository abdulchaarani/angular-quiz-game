import { Answer } from '@app/model/schema/answer.schema';
import { Socket } from 'socket.io';

export interface Player {
    username: string;
    answer: Answer;
    score: number;
    bonusCount: number;
    isPlaying: boolean;
    isChatActive: boolean;
    socket: Socket;
    state: string;
}
