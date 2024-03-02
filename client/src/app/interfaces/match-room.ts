import { Game } from './game';
import { Player } from './player';

export interface MatchRoom {
    code: string;
    isLocked: boolean;
    game: Game;
    bannedUsernames: string[];
    players: Player[];
}
