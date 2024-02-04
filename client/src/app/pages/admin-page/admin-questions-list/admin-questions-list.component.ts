import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GamesCreationService } from '@app/services/games-creation.service';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent implements OnInit {
    game: Game = {
        id: '1',
        title: 'Test',
        description: 'Test',
        lastModification: '2024-02-02T01:20:39.439+00:00',
        duration: 10,
        isVisible: true,
        questions: [],
    };

    response: string = '';

    constructor(
        private readonly questionService: QuestionService,
        private readonly gamesCreationService: GamesCreationService,
    ) {}

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.game.questions, event.previousIndex, event.currentIndex);
    }

    ngOnInit() {
        this.questionService.getAllQuestions().subscribe((data: Question[]) => (this.game.questions = [...data]));
    }

    changeDuration(event: Event) {
        this.game.duration = Number((event.target as HTMLInputElement).value);
    }

    deleteQuestion(questionId: string) {
        this.questionService.deleteQuestion(questionId).subscribe((response: HttpResponse<string>) => {
            if (response.ok) this.game.questions = this.game.questions.filter((question: Question) => question.id !== questionId);
        });
    }

    addNewGame() {
        const newQuestion: Question = {
            id: '',
            type: 'QCM',
            text: 'Quelle est la question?',
            points: 20,
            lastModification: '2024-01-26T14:21:19+00:00',
        };

        this.game.questions.push(newQuestion);
    }

    saveGame() {
        this.gamesCreationService.sendModifiedGame(this.game);
    }
}
