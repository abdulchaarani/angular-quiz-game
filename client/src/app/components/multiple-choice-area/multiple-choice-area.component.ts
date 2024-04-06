import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchContextService } from '@app/services/question-context/question-context.service';

@Component({
    selector: 'app-multiple-choice-area',
    templateUrl: './multiple-choice-area.component.html',
    styleUrls: ['./multiple-choice-area.component.scss'],
})
export class MultipleChoiceAreaComponent implements OnInit {
    @Input() isSelectionEnabled: boolean;
    @Input() currentQuestion: Question;
    @Input() isCooldown: boolean;
    selectedAnswers: Choice[];

    constructor(
        public matchRoomService: MatchRoomService,
        public matchContextService: MatchContextService,
        public answerService: AnswerService,
    ) {}

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
    }

    selectChoice(choice: Choice): void {
        if (this.isSelectionEnabled) {
            if (!this.selectedAnswers.includes(choice)) {
                this.selectedAnswers.push(choice);
                this.answerService.selectChoice(choice.text, {
                    username: this.matchRoomService.getUsername(),
                    roomCode: this.matchRoomService.getRoomCode(),
                });
            } else {
                this.selectedAnswers = this.selectedAnswers.filter((answer) => answer !== choice);
                this.answerService.deselectChoice(choice.text, {
                    username: this.matchRoomService.getUsername(),
                    roomCode: this.matchRoomService.getRoomCode(),
                });
            }
        }
    }

    isSelected(choice: Choice): boolean {
        return this.selectedAnswers.includes(choice);
    }

    isCorrectAnswer(choice: Choice): boolean {
        return this.answerService.correctAnswer.includes(choice.text);
    }

    private resetStateForNewQuestion(): void {
        this.selectedAnswers = [];
        this.answerService.resetStateForNewQuestion();
    }
}
