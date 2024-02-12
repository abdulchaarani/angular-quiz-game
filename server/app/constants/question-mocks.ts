import { Question } from '@app/model/database/question';
import { choiceMocks } from './choice-mocks';
import { getRandomString } from './test-utils';

const getQuestion = (): Question => ({
    id: getRandomString(),
    type: 'QCM',
    text: getRandomString(),
    points: 50,
    choices: [
        {
            text: getRandomString(),
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
    ],
    lastModification: new Date(),
});

const validQuestion = getQuestion();
validQuestion.choices = [
    { text: 'a', isCorrect: true },
    { text: 'b', isCorrect: false },
];

const fourChoicesQuestion = getQuestion();
fourChoicesQuestion.choices = [
    { text: 'a', isCorrect: true },
    { text: 'b', isCorrect: false },
    { text: 'c', isCorrect: true },
    { text: 'd', isCorrect: false },
];

const allTrueQuestion = getQuestion();
allTrueQuestion.choices = [
    { text: 'a', isCorrect: true },
    { text: 'b', isCorrect: true },
];

const allFalseQuestion = getQuestion();
allFalseQuestion.choices = [
    { text: 'a', isCorrect: false },
    { text: 'b', isCorrect: false },
];

export const getQuestionWithChoices = (): Question => {
    const mockQuestion = new Question();
    mockQuestion.choices = [choiceMocks.firstCorrect, choiceMocks.secondCorrect, choiceMocks.incorrect];
    return mockQuestion;
};

export const questionMocks = { getQuestion, validQuestion, fourChoicesQuestion, allTrueQuestion, allFalseQuestion, getQuestionWithChoices };
