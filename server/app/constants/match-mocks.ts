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
    bannedUsernames: [],
    players: [],
    messages: [],
    hostSocket: undefined,
};
const MOCK_ROOM_CODE = 'mockCode';

export { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_ROOM_CODE, MOCK_USER_INFO };
