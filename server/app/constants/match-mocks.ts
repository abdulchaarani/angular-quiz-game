import { ChoiceTracker } from '@app/model/tally-trackers/choice-tracker/choice-tracker';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { PlayerState } from '@common/constants/player-states';
import { getMockGame } from './game-mocks';
import { MultipleChoiceAnswer } from '@app/model/answer-types/multiple-choice-answer/multiple-choice-answer';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { getMockQuestion } from './question-mocks';

const MOCK_USER_INFO = { roomCode: '', username: '' };
const MOCK_MESSAGE = { text: 'Text', author: '', date: new Date() };
const MOCK_MESSAGE_INFO = { roomCode: '', message: MOCK_MESSAGE };
const MOCK_PLAYER: Player = {
    username: '',
    answer: new MultipleChoiceAnswer(),
    score: 0,
    answerCorrectness: AnswerCorrectness.WRONG,
    bonusCount: 0,
    isPlaying: true,
    socket: undefined,
    state: PlayerState.default,
};
const MOCK_MATCH_ROOM: MatchRoom = {
    code: '',
    isLocked: false,
    isPlaying: false,
    game: getMockGame(),
    gameLength: 1,
    questionDuration: 60,
    currentQuestion: getMockQuestion(),
    currentQuestionIndex: 0,
    currentQuestionAnswer: [],
    choiceTracker: new ChoiceTracker(),
    matchHistograms: [],
    bannedUsernames: [],
    players: [],
    activePlayers: 0,
    submittedPlayers: 0,
    messages: [],
    hostSocket: undefined,
    isTestRoom: false,
    startTime: new Date(),
};

const MOCK_TEST_MATCH_ROOM: MatchRoom = {
    code: '',
    isLocked: false,
    isPlaying: false,
    game: getMockGame(),
    gameLength: 1,
    questionDuration: 60,
    currentQuestion: getMockQuestion(),
    currentQuestionIndex: 0,
    currentQuestionAnswer: [],
    choiceTracker: new ChoiceTracker(),
    matchHistograms: [],
    bannedUsernames: [],
    players: [],
    activePlayers: 0,
    submittedPlayers: 0,
    messages: [],
    hostSocket: undefined,
    isTestRoom: true,
    startTime: new Date(),
};

const MOCK_PLAYER_ROOM: MatchRoom = {
    code: '',
    isLocked: false,
    isPlaying: false,
    game: getMockGame(),
    gameLength: 1,
    questionDuration: 60,
    currentQuestion: getMockQuestion(),
    currentQuestionIndex: 0,
    currentQuestionAnswer: [],
    choiceTracker: new ChoiceTracker(),
    matchHistograms: [],
    bannedUsernames: [],
    players: [MOCK_PLAYER],
    activePlayers: 1,
    submittedPlayers: 0,
    messages: [],
    hostSocket: undefined,
    isTestRoom: false,
    startTime: new Date(),
};
const MOCK_ROOM_CODE = 'mockCode';
const MOCK_USERNAME = 'mockUsername';

export {
    MOCK_MATCH_ROOM,
    MOCK_MESSAGE,
    MOCK_MESSAGE_INFO,
    MOCK_PLAYER,
    MOCK_PLAYER_ROOM,
    MOCK_ROOM_CODE,
    MOCK_TEST_MATCH_ROOM,
    MOCK_USERNAME,
    MOCK_USER_INFO,
};
