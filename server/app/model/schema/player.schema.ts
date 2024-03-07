import { Socket } from 'socket.io';
import { Answer } from './answer.schema';
export interface Player {
    username: string;
    answer: Answer;
    score: number;
    bonusCount: number;
    isPlaying: boolean;
    socket: Socket;
}
