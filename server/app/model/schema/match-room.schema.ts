import { Game } from '../database/game';
import { Message } from './message.schema';
import { Player } from './player.schema';

export interface MatchRoom {
    code: string;
    isLocked: boolean;
    game: Game;
    bannedUsernames: string[];
    players: Player[];
    messages: Message[];
}
// TODO: Add interface for results
