import { ChoiceTracker } from '@app/model/choice-tracker/choice-tracker';
import { Game } from '@app/model/database/game';
import { Socket } from 'socket.io';
import { Message } from './message.schema';
import { Player } from './player.schema';
import { Histogram } from '@common/interfaces/histogram';

export interface MatchRoom {
    code: string;
    isLocked: boolean;
    isPlaying: boolean;
    game: Game;
    gameLength: number;
    currentQuestionIndex: number;
    currentQuestionAnswer: string[];
    currentChoiceTracker: ChoiceTracker;
    matchHistograms: Histogram[];
    bannedUsernames: string[];
    players: Player[];
    activePlayers: number;
    submittedPlayers: number;
    messages: Message[];
    hostSocket: Socket;
    isTestRoom: boolean;
}
