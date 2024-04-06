import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { FREE_ANSWER_MAX_LENGTH } from '@common/constants/match-constants';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { AnswerCorrectness } from '@common/constants/answer-correctness';

@Component({
    selector: 'app-long-answer-area',
    templateUrl: './long-answer-area.component.html',
    styleUrls: ['./long-answer-area.component.scss'],
})
export class LongAnswerAreaComponent implements OnInit {
    @Input() isSelectionEnabled: boolean;
    @Input() currentQuestion: Question;
    answerMaxLength = FREE_ANSWER_MAX_LENGTH;
    currentAnswer: string = '';

    constructor(
        public matchRoomService: MatchRoomService,
        public questionContextService: QuestionContextService,
        public answerService: AnswerService,
    ) {}

    get answerOptions(): (string | AnswerCorrectness)[] {
        return Object.values(AnswerCorrectness).filter((value) => isFinite(Number(value)));
    }

    ngOnInit(): void {
        this.answerService.resetStateForNewQuestion();
    }

    updateAnswer(): void {
        if (this.isSelectionEnabled) {
            this.answerService.updateLongAnswer(this.currentAnswer);
        }
    }
}
