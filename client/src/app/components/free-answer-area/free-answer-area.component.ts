import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Subscription } from 'rxjs';
import { FREE_ANSWER_MAX_LENGTH } from '@common/constants/match-constants';

@Component({
    selector: 'app-free-answer-area',
    templateUrl: './free-answer-area.component.html',
    styleUrls: ['./free-answer-area.component.scss'],
})
export class FreeAnswerAreaComponent implements OnInit, OnDestroy {
    @Input() isSelectionEnabled: boolean;
    @Input() currentQuestion: Question;
    showFeedback: boolean;
    answerMaxLength = FREE_ANSWER_MAX_LENGTH;
    answer: string;

    private eventSubscriptions: Subscription[];

    constructor(
        public matchRoomService: MatchRoomService,
        private readonly answerService: AnswerService,
    ) {}

    get matchRoomCode() {
        return this.matchRoomService.getRoomCode();
    }

    get username() {
        return this.matchRoomService.getUsername();
    }

    ngOnInit(): void {
        this.resetStateForNewQuestion();
        this.initialiseSubscriptions();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    private subscribeToCurrentQuestion() {
        const currentQuestionSubscription = this.matchRoomService.currentQuestion$.subscribe(() => {
            this.resetStateForNewQuestion();
        });
        this.eventSubscriptions.push(currentQuestionSubscription);
    }

    private subscribeToFeedback() {
        const feedbackChangeSubscription = this.answerService.feedback$.subscribe(() => {
            console.log(this.answer);
            this.showFeedback = true;
        });

        this.eventSubscriptions.push(feedbackChangeSubscription);
    }

    private initialiseSubscriptions() {
        this.subscribeToCurrentQuestion();
        this.subscribeToFeedback();
    }

    private resetStateForNewQuestion(): void {
        this.eventSubscriptions = [];
        this.showFeedback = false;
        this.answer = '';
    }
}
