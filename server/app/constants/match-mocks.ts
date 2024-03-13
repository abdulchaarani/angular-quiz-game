import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { getMockGame } from './game-mocks';
import { ChoiceTally } from '@app/model/choice-tally/choice-tally';

const MOCK_USER_INFO = { roomCode: '', username: '' };
const MOCK_MESSAGE = {text: 'Text', author: '', date: new Date()};
const MOCK_MESSAGE_INFO ={ roomCode: '', message: MOCK_MESSAGE }
const MOCK_PLAYER: Player = {
    username: '',
    answer: { selectedChoices: new Map<string, boolean>(), isSubmited: false },
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
    gameLength: 1,
    currentQuestionIndex: 0,
    currentQuestionAnswer: [],
    choiceTally: new ChoiceTally(),
    bannedUsernames: [],
    players: [],
    activePlayers: 0,
    submittedPlayers: 0,
    messages: [],
    hostSocket: undefined,
};

const MOCK_PLAYER_ROOM: MatchRoom = {
    code: '',
    isLocked: false,
    isPlaying: false,
    game: getMockGame(),
    gameLength: 1,
    currentQuestionIndex: 0,
    currentQuestionAnswer: [],
    choiceTally: new ChoiceTally(),
    bannedUsernames: [],
    players: [MOCK_PLAYER],
    activePlayers: 1,
    submittedPlayers: 0,
    messages: [],
    hostSocket: undefined,
};
const MOCK_ROOM_CODE = 'mockCode';
const MOCK_USERNAME = 'mockUsername';
export { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_PLAYER_ROOM, MOCK_ROOM_CODE, MOCK_USERNAME, MOCK_USER_INFO, MOCK_MESSAGE_INFO, MOCK_MESSAGE };
