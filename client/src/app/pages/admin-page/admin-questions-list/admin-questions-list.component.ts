import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';
// import { GamesCreationService } from '@app/services/games-creation.service';
import { GamesService } from '@app/services/games.service';
import { QuestionService } from '@app/services/question.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '@app/services/notification.service';

@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent implements OnInit {
    dialogState: boolean = false;

    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() createQuestionEventQuestionBank: EventEmitter<Question> = new EventEmitter<Question>();
    game: Game;
    response: string = '';

    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
        private readonly gamesService: GamesService,
        private route: ActivatedRoute,
        //private router: Router,
        private readonly notificationService: NotificationService,
    ) {}
    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.game.questions, event.previousIndex, event.currentIndex);
    }

    changeDuration(event: Event) {
        this.game.duration = Number((event.target as HTMLInputElement).value);
    }

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

    deleteQuestion(questionId: string) {
        if (this.game.questions.length === 1 || this.game.id === null) {
            return;
        }
        this.game.questions = this.game.questions.filter((question: Question) => question.id !== questionId);
    }

    saveGame() {
        console.log(this.game.questions);
        this.gamesService.replaceGame(this.game).subscribe((response: HttpResponse<string>) => {
            () => {
                this.response = 'Game saved';
            };
            (error: HttpErrorResponse) => {
                this.response = 'Game not saved';
            };
        });
    }

    addNewQuestion(newQuestion: Question) {
        //console.log('new', newQuestion);
        this.game.questions.push(newQuestion);
    }

    toggleCreateQuestion() {
        this.dialogState = !this.dialogState;
    }

   // dialogRef: unknown;
   dialogRef: any;

    // https://stackoverflow.com/questions/47592364/usage-of-mat-dialog-close
    openDialog() {
        if (!this.dialogState) {
            this.dialogRef = this.dialog.open(CreateQuestionComponent, {
                height: '70%',
                width: '100%',
            });
            this.dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
                if (newQuestion) {
                    this.addNewQuestion(newQuestion);
                    this.dialogRef.close();
                }
                this.dialogState = false;
            });

            this.dialogRef.componentInstance.createQuestionEventQuestionBank.subscribe((newQuestion: Question) => {
                if (newQuestion) {
                        this.questionService.createQuestion(newQuestion)
                        .subscribe({
                            next: () => {
                                this.notificationService.displaySuccessMessage('Question ajoutée à la banque avec succès! 😺');
                            },
                            error: (error: HttpErrorResponse) =>
                                this.notificationService.displayErrorMessage(`La question n'a pas pu être ajoutée. 😿 \n ${error.message}`),
                        });
        
                    }
                    //this.addQuestion(newQuestion);
                    //this.questionService.createQuestion(newQuestion).subscribe()
                    //this.questionService.createQuestion(newQuestion);
                    //this.questionsBank;
                    this.dialogRef.close();
                this.dialogState = false;
            });
        }
    }
}

