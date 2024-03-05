import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { getMockGame } from './game-mocks';

const MOCK_USER_INFO = { roomCode: '', username: '' };
const MOCK_PLAYER: Player = {
    username: '',
    score: 0,
    bonusCount: 0,
    isPlaying: true,
    socket: undefined,
};
const MOCK_MATCH_ROOM: MatchRoom = {
    code: '',
    isLocked: false,
    isPlaying: false,
    game: getMockGame(),
    gameLength: 4,
    currentQuestionIndex: 0,
    bannedUsernames: [],
    players: [],
    messages: [],
    hostSocket: undefined,
};

const MOCK_PLAYER_ROOM: MatchRoom = {
    code: '',
    isLocked: false,
    isPlaying: false,
    game: getMockGame(),
    gameLength: 4,
    currentQuestionIndex: 0,
    bannedUsernames: [],
    players: [MOCK_PLAYER],
    messages: [],
    hostSocket: undefined,
};
const MOCK_ROOM_CODE = 'mockCode';
const MOCK_USERNAME = 'mockUsername';
export { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_PLAYER_ROOM, MOCK_ROOM_CODE, MOCK_USERNAME, MOCK_USER_INFO };
