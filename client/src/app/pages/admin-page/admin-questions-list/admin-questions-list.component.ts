import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit , EventEmitter, Output} from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';
// import { GamesCreationService } from '@app/services/games-creation.service';
import { GamesService } from '@app/services/games.service';
// import { QuestionService } from '@app/services/question.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent implements OnInit {
    dialogState: boolean = false;

    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    game: Game ;
    response: string = '';

    constructor(
        public dialog: MatDialog,
        private readonly gamesService: GamesService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
    ) {}

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.game.questions, event.previousIndex, event.currentIndex);
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

    changeDuration(event: Event) {
        this.game.duration = Number((event.target as HTMLInputElement).value);
    }

    gameEditForm = this.formBuilder.nonNullable.group({
        title : ['', Validators.required],
        description: ['', Validators.required],
    });

    onSubmit(): void {
        if (this.gameEditForm.value.title && this.gameEditForm.value.description) {
            this.game.title = this.gameEditForm.value.title;
            this.game.description = this.gameEditForm.value.description;
            this.saveGame();
        }
    }

    deleteQuestion(questionId: string) {
        if (this.game.questions.length === 1 || this.game.id === null) {
            return;
        }
        this.game.questions = this.game.questions.filter((question: Question) => question.id !== questionId);
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

    addNewQuestion(newQuestion: Question) {
        console.log("new", newQuestion);
        this.game.questions.push(newQuestion);
    }

    toggleCreateQuestion() {
        this.dialogState = !this.dialogState;
    }

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
        }
    }
}
