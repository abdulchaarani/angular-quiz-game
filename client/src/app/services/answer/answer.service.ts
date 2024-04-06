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

@Injectable({
    providedIn: 'root',
})
export class AnswerService {
    feedback$: Observable<Feedback>;
    isFeedback$: Observable<boolean>;
    bonusPoints$: Observable<number>;
    endGame$: Observable<boolean>;
    playersAnswers: LongAnswerInfo[];
    isTimesUp$: Observable<boolean>;
    gradeAnswers: boolean = false;
    isGradingComplete: boolean = false;
    showFeedback: boolean = false;

    private isFeedbackSource: Subject<boolean>;
    private feedbackSource: Subject<Feedback>;
    private bonusPointsSubject: Subject<number>;
    private endGameSubject: Subject<boolean>;
    private isTimesUp: Subject<boolean>;

    constructor(
        public socketService: SocketHandlerService,
        public matchRoomService: MatchRoomService,
    ) {
        this.initialiseAnwserSubjects();
    }

    resetStateForNewQuestion() {
        this.gradeAnswers = false;
        this.isGradingComplete = false;
        this.showFeedback = false;
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

    onFeedback() {
        this.socketService.on(AnswerEvents.Feedback, (data: Feedback) => {
            this.feedbackSource.next(data);
            this.isFeedbackSource.next(true);
            this.showFeedback = true;
        });
    }

    onBonusPoints() {
        this.socketService.on(AnswerEvents.Bonus, (data: number) => {
            this.bonusPointsSubject.next(data);
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
            this.isTimesUp.next(true);
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
        this.feedbackSource = new Subject<Feedback>();
        this.bonusPointsSubject = new Subject<number>();
        this.isFeedbackSource = new Subject<boolean>();
        this.endGameSubject = new Subject<boolean>();
        this.isTimesUp = new Subject<boolean>();
        this.feedback$ = this.feedbackSource.asObservable();
        this.bonusPoints$ = this.bonusPointsSubject.asObservable();
        this.isFeedback$ = this.isFeedbackSource.asObservable();
        this.endGame$ = this.endGameSubject.asObservable();
        this.isTimesUp$ = this.isTimesUp.asObservable();
    }
}
