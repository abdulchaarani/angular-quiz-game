import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Subscription } from 'rxjs';
import { FREE_ANSWER_MAX_LENGTH } from '@common/constants/match-constants';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { GradesInfo } from '@common/interfaces/grades-info';
import { AnswerCorrectness } from '@common/constants/answer-correctness';

@Component({
    selector: 'app-long-answer-area',
    templateUrl: './long-answer-area.component.html',
    styleUrls: ['./long-answer-area.component.scss'],
})
export class LongAnswerAreaComponent implements OnInit, OnDestroy {
    @Input() isSelectionEnabled: boolean;
    @Input() currentQuestion: Question;
    showFeedback: boolean = false;
    answerMaxLength = FREE_ANSWER_MAX_LENGTH;
    currentAnswer: string = '';
    gradeAnswers: boolean = false;
    playersAnswers: LongAnswerInfo[] = [];
    gradingComplete: boolean = false;

    private eventSubscriptions: Subscription[];

    constructor(
        public matchRoomService: MatchRoomService,
        public questionContextService: QuestionContextService,
        public answerService: AnswerService,
    ) {}

    get matchRoomCode() {
        return this.matchRoomService.getRoomCode();
    }

    get username() {
        return this.matchRoomService.getUsername();
    }

    get answerOptions(): typeof AnswerCorrectness {
        return AnswerCorrectness;
    }

    ngOnInit(): void {
        this.resetStateForNewQuestion();
        this.initialiseSubscriptions();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    updateAnswer(): void {
        if (this.isSelectionEnabled) {
            this.answerService.updateFreeAnswer(this.currentAnswer, { username: this.username, roomCode: this.matchRoomCode });
        }
    }

    handleGrading() {
        this.gradingComplete = this.playersAnswers.every((answer) => answer.score !== undefined);
    }

    sendGrades() {
        const gradesInfo: GradesInfo = { matchRoomCode: this.matchRoomCode, grades: this.playersAnswers };
        this.answerService.sendGrades(gradesInfo);
        this.gradeAnswers = false;
    }

    private subscribeToCurrentQuestion() {
        const currentQuestionSubscription = this.matchRoomService.currentQuestion$.subscribe(() => {
            this.resetStateForNewQuestion();
        });
        this.eventSubscriptions.push(currentQuestionSubscription);
    }

    private subscribeToFeedback() {
        const feedbackChangeSubscription = this.answerService.feedback$.subscribe(() => {
            this.showFeedback = true;
        });

        this.eventSubscriptions.push(feedbackChangeSubscription);
    }

    private subscribeToPlayersAnswers() {
        const playersAnswersSubscription = this.answerService.playersLongAnswers$.subscribe((answers) => {
            this.playersAnswers = answers;
            this.gradeAnswers = true;
        });

        this.eventSubscriptions.push(playersAnswersSubscription);
    }

    private initialiseSubscriptions() {
        this.subscribeToCurrentQuestion();
        this.subscribeToFeedback();
        this.subscribeToPlayersAnswers();
    }

    private resetStateForNewQuestion(): void {
        this.eventSubscriptions = [];
        this.showFeedback = false;
        this.currentAnswer = '';
    }
}
