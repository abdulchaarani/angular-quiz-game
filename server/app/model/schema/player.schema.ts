// import { Answer } from '@app/model/schema/answer.schema';
import { LongAnswer, MultipleChoiceAnswer } from '@app/answer/answer';
import { Socket } from 'socket.io';
import { AnswerCorrectness } from '@common/constants/answer-correctness';

export interface Player {
    username: string;
    answer: MultipleChoiceAnswer | LongAnswer;
    score: number;
    answerCorrectness: AnswerCorrectness;
    bonusCount: number;
    isPlaying: boolean;
    socket: Socket;
    state: string;
}
