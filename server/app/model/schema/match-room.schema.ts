import { Game } from '../database/game';
import { Player } from './player.schema';

export interface MatchRoom {
    code: string;
    isLocked: boolean;
    game: Game;
    bannedUsernames: string[];
    players: Player[];
}
