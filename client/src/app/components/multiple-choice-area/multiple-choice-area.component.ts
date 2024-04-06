import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchContextService } from '@app/services/question-context/question-context.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-multiple-choice-area',
    templateUrl: './multiple-choice-area.component.html',
    styleUrls: ['./multiple-choice-area.component.scss'],
})
export class MultipleChoiceAreaComponent implements OnInit, OnDestroy {
    @Input() isSelectionEnabled: boolean;
    @Input() currentQuestion: Question;
    @Input() isCooldown: boolean;
    selectedAnswers: Choice[];
    correctAnswers: string[];
    showFeedback: boolean;

    private eventSubscriptions: Subscription[];

    constructor(
        public matchRoomService: MatchRoomService,
        public questionContextService: MatchContextService,
        private readonly answerService: AnswerService,
    ) {}

    get matchRoomCode() {
        return this.matchRoomService.getRoomCode();
    }

    get username() {
        return this.matchRoomService.getUsername();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (document?.activeElement?.id === 'chat-input') return;

        const numKey = parseInt(event.key, 5);
        if (!numKey || !this.currentQuestion.choices) return;

        if (numKey >= 1 && numKey <= this.currentQuestion.choices.length) {
            const choiceIndex = numKey - 1;
            const choice = this.currentQuestion.choices[choiceIndex];
            if (choice) {
                this.selectChoice(choice);
            }
        }
    }

    ngOnInit(): void {
        this.resetStateForNewQuestion();
        this.initialiseSubscriptions();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    selectChoice(choice: Choice): void {
        if (this.isSelectionEnabled) {
            if (!this.selectedAnswers.includes(choice)) {
                this.selectedAnswers.push(choice);
                this.answerService.selectChoice(choice.text, { username: this.username, roomCode: this.matchRoomCode });
            } else {
                this.selectedAnswers = this.selectedAnswers.filter((answer) => answer !== choice);
                this.answerService.deselectChoice(choice.text, { username: this.username, roomCode: this.matchRoomCode });
            }
        }
    }

    isSelected(choice: Choice): boolean {
        return this.selectedAnswers.includes(choice);
    }

    isCorrectAnswer(choice: Choice): boolean {
        return this.correctAnswers.includes(choice.text);
    }

    private subscribeToFeedback() {
        const feedbackChangeSubscription = this.answerService.feedback$.subscribe((feedback) => {
            if (feedback && feedback.correctAnswer) {
                this.correctAnswers = feedback.correctAnswer;
                this.showFeedback = true;
            }
        });

        this.eventSubscriptions.push(feedbackChangeSubscription);
    }

    private initialiseSubscriptions() {
        this.subscribeToFeedback();
    }

    private resetStateForNewQuestion(): void {
        this.selectedAnswers = [];
        this.eventSubscriptions = [];
        this.selectedAnswers = [];
        this.correctAnswers = [];
        this.showFeedback = false;
    }
}
