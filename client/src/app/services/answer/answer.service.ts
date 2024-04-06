import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { ChoiceInfo } from '@common/interfaces/choice-info';
import { Feedback } from '@common/interfaces/feedback';
import { UserInfo } from '@common/interfaces/user-info';
import { AnswerEvents } from '@common/events/answer.events';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { GradesInfo } from '@common/interfaces/grades-info';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchEvents } from '@common/events/match.events';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { MatchContextService } from '@app/services/question-context/question-context.service';
import { MatchContext } from '@app/constants/states';

@Injectable({
    providedIn: 'root',
})
export class AnswerService {
    playersAnswers: LongAnswerInfo[];
    feedback: Feedback;
    gradeAnswers: boolean;
    isGradingComplete: boolean;
    showFeedback: boolean;
    isNextQuestionButton: boolean;
    isSelectionEnabled: boolean;
    correctAnswer: string[];
    answerCorrectness: AnswerCorrectness;
    playerScore: number;
    bonusPoints: number;
    isTimesUp: boolean;
    isEndGame: boolean;
    currentLongAnswer: string;

    constructor(
        public socketService: SocketHandlerService,
        public matchRoomService: MatchRoomService,
        private readonly matchContextService: MatchContextService,
    ) {
        this.listenToAnswerEvents();
    }

    listenToAnswerEvents() {
        this.onFeedback();
        this.onBonusPoints();
        this.onEndGame();
        this.onTimesUp();
        this.onGradeAnswers();
        this.onNextQuestion();
    }

    resetStateForNewQuestion() {
        this.feedback = {} as Feedback;
        this.correctAnswer = [];
        this.gradeAnswers = false;
        this.isGradingComplete = false;
        this.showFeedback = false;
        this.isSelectionEnabled = true;
        this.answerCorrectness = AnswerCorrectness.WRONG;
        this.bonusPoints = 0;
        this.isNextQuestionButton = false;
        this.isTimesUp = false;
        this.isEndGame = false;
        this.currentLongAnswer = '';
    }

    selectChoice(choice: string, userInfo: UserInfo) {
        const choiceInfo: ChoiceInfo = { choice, userInfo };
        this.socketService.send(AnswerEvents.SelectChoice, choiceInfo);
    }

    deselectChoice(choice: string, userInfo: UserInfo) {
        const choiceInfo: ChoiceInfo = { choice, userInfo };
        this.socketService.send(AnswerEvents.DeselectChoice, choiceInfo);
    }

    submitAnswer(userInfo: UserInfo) {
        this.socketService.send(AnswerEvents.SubmitAnswer, userInfo);
    }

    updateLongAnswer() {
        if (!this.isSelectionEnabled) return;
        const userInfo = { username: this.matchRoomService.getUsername(), roomCode: this.matchRoomService.getRoomCode() };
        const choiceInfo: ChoiceInfo = { choice: this.currentLongAnswer, userInfo };
        this.socketService.send(AnswerEvents.UpdateLongAnswer, choiceInfo);
    }

    // TODO: fragment
    onFeedback() {
        this.socketService.on(AnswerEvents.Feedback, (feedback: Feedback) => {
            this.feedback = feedback;
            this.showFeedback = true;
            this.isNextQuestionButton = true;

            if (feedback) {
                if (this.feedback.correctAnswer) this.correctAnswer = this.feedback.correctAnswer;
                this.isSelectionEnabled = false;
                this.answerCorrectness = feedback.answerCorrectness;
                this.playerScore = feedback.score;
                // TODO: À revoir si chaque client renvoi son data...
                this.matchRoomService.sendPlayersData(this.matchRoomService.getRoomCode());
                const context = this.matchContextService.getContext();
                if (context === MatchContext.TestPage || context === MatchContext.RandomMode) {
                    this.matchRoomService.nextQuestion();
                    this.isNextQuestionButton = false;
                }
            }
        });
    }

    onBonusPoints() {
        this.socketService.on(AnswerEvents.Bonus, (bonus: number) => {
            this.bonusPoints = bonus;
        });
    }

    onEndGame() {
        this.socketService.on(AnswerEvents.EndGame, () => {
            this.isEndGame = true;
        });
    }

    onGradeAnswers() {
        this.socketService.on(AnswerEvents.GradeAnswers, (answers: LongAnswerInfo[]) => {
            this.playersAnswers = answers;
            this.gradeAnswers = true;
        });
    }

    onNextQuestion() {
        this.socketService.on(MatchEvents.NextQuestion, () => {
            this.resetStateForNewQuestion();
        });
    }

    onTimesUp() {
        this.socketService.on(AnswerEvents.TimesUp, () => {
            this.isTimesUp = true;
            this.isSelectionEnabled = false;
        });
    }

    sendGrades() {
        this.gradeAnswers = false;
        const gradesInfo: GradesInfo = { matchRoomCode: this.matchRoomService.getRoomCode(), grades: this.playersAnswers };
        this.socketService.send(AnswerEvents.Grades, gradesInfo);
    }

    handleGrading(): void {
        this.isGradingComplete = this.playersAnswers.every((answer: LongAnswerInfo) => answer.score !== null);
    }
}
