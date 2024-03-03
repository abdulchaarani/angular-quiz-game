import { Game } from '@app/model/database/game';
import { Socket } from 'socket.io';
import { Message } from './message.schema';
import { Player } from './player.schema';

export interface MatchRoom {
    code: string;
    isLocked: boolean;
    isPlaying: boolean;
    game: Game;
    bannedUsernames: string[];
    players: Player[];
    messages: Message[];
    hostSocket: Socket;
}
// TODO: Add interface for results
