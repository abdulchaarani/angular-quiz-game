import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpResponse } from '@angular/common/http';
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
        private route: ActivatedRoute
    ) {
    }

    game: Game;

    isValid: boolean = false;

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.game.questions, event.previousIndex, event.currentIndex);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = params['id']; 
            this.gamesService.getGameById(id).subscribe((game: Game) => {
                this.game = game;
                this.isValid = true;
            });
          });
    }
    
    changeDuration(event: Event) {
        this.game.duration = Number((event.target as HTMLInputElement).value);
    }

    deleteQuestion(questionId: string) {
        if (questionId === '' || questionId === undefined) {
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
            if (response.ok) {
                this.response = 'Game saved';
            } else {
                this.response = 'Error';
            }
        });
    }
}
