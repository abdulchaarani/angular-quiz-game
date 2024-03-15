import { ChoiceTally } from '@app/model/choice-tally/choice-tally';
import { Game } from '@app/model/database/game';
import { Socket } from 'socket.io';
import { Message } from './message.schema';
import { Player } from './player.schema';

export interface MatchRoom {
    code: string;
    isLocked: boolean;
    isPlaying: boolean;
    game: Game;
    gameLength: number;
    currentQuestionIndex: number;
    currentQuestionAnswer: string[];
    choiceTally: ChoiceTally;
    bannedUsernames: string[];
    players: Player[];
    activePlayers: number;
    submittedPlayers: number;
    messages: Message[];
    hostSocket: Socket;
    isTestRoom: boolean;
}
