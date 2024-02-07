import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
// import { GamesCreationService } from '@app/services/games-creation.service';
import { GamesService } from '@app/services/games.service';
// import { QuestionService } from '@app/services/question.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent implements OnInit {
    response: string = '';

    constructor(
        // private readonly questionService: QuestionService,
        // private readonly gamesCreationService: GamesCreationService,
        private readonly gamesService: GamesService,
        private route: ActivatedRoute,
    ) {}

    game: Game;

    isValid: boolean = false;

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const id = params['id'];
            this.gamesService.getGameById(id).subscribe((game: Game) => {
                this.game = game;
                this.isValid = true;
            });
        });
    }

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.game.questions, event.previousIndex, event.currentIndex);
    }

    changeDuration(event: Event) {
        this.game.duration = Number((event.target as HTMLInputElement).value);
    }

    deleteQuestion(questionId: string) {
        if (this.game.questions.length === 1 || this.game.id === null) {
            return;
        }
        this.game.questions = this.game.questions.filter((question: Question) => question.id !== questionId);
    }

    addNewGame() {
        const newQuestion: Question = {
            id: '',
            type: 'QCM',
            text: 'Quelle est la question?',
            points: 20,
            lastModification: '2024-01-26T14:21:19+00:',
        };

        this.game.questions.push(newQuestion);
    }

    saveGame() {
        this.gamesService.replaceGame(this.game).subscribe((response: HttpResponse<string>) => {
            () => {
                this.response = 'Game saved';
            };
            (error: HttpErrorResponse) => {
                this.response = 'Game not saved';
            };
        });
    }
}
