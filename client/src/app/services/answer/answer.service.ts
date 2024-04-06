import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { ChoiceInfo } from '@common/interfaces/choice-info';
import { Feedback } from '@common/interfaces/feedback';
import { UserInfo } from '@common/interfaces/user-info';
import { Observable, Subject } from 'rxjs';
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
    endGame$: Observable<boolean>;
    playersAnswers: LongAnswerInfo[];
    isTimesUp$: Observable<boolean>;

    feedback: Feedback;
    gradeAnswers: boolean = false;
    isGradingComplete: boolean = false;
    showFeedback: boolean = false;
    isNextQuestionButton: boolean = false;
    isSelectionEnabled: boolean = true;
    correctAnswer: string[] = [];
    answerCorrectness: AnswerCorrectness;
    playerScore: number;
    bonusPoints: number;
    isTimesUp: boolean;

    private endGameSubject: Subject<boolean>;

    constructor(
        public socketService: SocketHandlerService,
        public matchRoomService: MatchRoomService,
        private readonly matchContextService: MatchContextService,
    ) {
        this.initialiseAnwserSubjects();
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

    updateLongAnswer(answer: string) {
        const userInfo = { username: this.matchRoomService.getUsername(), roomCode: this.matchRoomService.getRoomCode() };
        const choiceInfo: ChoiceInfo = { choice: answer, userInfo };
        this.socketService.send(AnswerEvents.UpdateLongAnswer, choiceInfo);
    }

    // TODO: fragment
    onFeedback() {
        this.socketService.on(AnswerEvents.Feedback, (feedback: Feedback) => {
            this.feedback = feedback;
            this.showFeedback = true;
            this.isNextQuestionButton = true;

            if (this.feedback.correctAnswer) this.correctAnswer = this.feedback.correctAnswer;
            if (feedback) {
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
            this.endGameSubject.next(true);
        });
    }

    onGradeAnswers() {
        this.socketService.on(AnswerEvents.GradeAnswers, (answers: LongAnswerInfo[]) => {
            this.playersAnswers = answers;
            this.gradeAnswers = true;
        });
    }

    // TODO: put in constructor?
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

    private initialiseAnwserSubjects() {
        this.endGameSubject = new Subject<boolean>();
        this.endGame$ = this.endGameSubject.asObservable();
    }
}
