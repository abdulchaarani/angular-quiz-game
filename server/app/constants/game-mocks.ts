import { Game } from '@app/model/database/game';
import { questionMocks } from './question-mocks';
import { getRandomString } from './test-utils';

const gameYear = 2020;

const getGame = (): Game => ({
    id: getRandomString(),
    title: getRandomString(),
    description: getRandomString(),
    lastModification: new Date(gameYear, 1, 1),
    duration: 30,
    isVisible: true,
    questions: [
        {
            id: getRandomString(),
            type: 'QCM',
            text: getRandomString(),
            points: 30,
            choices: [
                {
                    text: getRandomString(),
                    isCorrect: true,
                },
                {
                    text: getRandomString(),
                    isCorrect: false,
                },
            ],
            lastModification: new Date(gameYear, 1, 1),
        },
    ],
});

const gameValidQuestion = getGame();
gameValidQuestion.questions = [questionMocks.validQuestion];

const pastYear = 2020;
const gameWithIsCorrectField: Game = {
    id: '',
    title: '',
    description: '',
    lastModification: new Date(pastYear, 1, 1),
    duration: 0,
    isVisible: true,
    questions: [
        {
            id: '0',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                    isCorrect: true,
                },
                {
                    text: '',
                    isCorrect: false,
                },
            ],
        },
        {
            id: '1',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                    isCorrect: true,
                },
                {
                    text: '',
                    isCorrect: false,
                },
            ],
        },
    ],
};

const gameWithoutIsCorrectField: Game = {
    id: '',
    title: '',
    description: '',
    lastModification: new Date(pastYear, 1, 1),
    duration: 0,
    isVisible: true,
    questions: [
        {
            id: '0',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                },
                {
                    text: '',
                },
            ],
        },
        {
            id: '1',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                },
                {
                    text: '',
                },
            ],
        },
    ],
};

export const gameMocks = {
    getGame,
    gameValidQuestion,
    gameWithIsCorrectField,
    gameWithoutIsCorrectField,
};
