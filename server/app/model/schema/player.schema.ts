import { Socket } from 'socket.io';
export interface Player {
    username: string;
    score: number;
    bonusCount: number;
    isPlaying: boolean;
    socket: Socket;
}
