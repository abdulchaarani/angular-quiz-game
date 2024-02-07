import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';
import { GamesCreationService } from '@app/services/games-creation.service';
import { QuestionService } from '@app/services/question.service';
import { MatDialog } from '@angular/material/dialog';
import { GamesService } from '@app/services/games.service';
// import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent implements OnInit {
    dialogState: boolean = false;

    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
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
        //public dialogRef: MatDialogRef<CreateQuestionComponent>,

        public dialog: MatDialog,
        private readonly questionService: QuestionService,
        private readonly gamesCreationService: GamesCreationService,
        private readonly gamesService: GamesService,
    ) // private route: ActivatedRoute,

    {}

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

    addNewQuestion(newQuestion: Question) {
        // this.questionService.add()

        // const newQuestion: Question = {
        //     id: '',
        //     type: 'QCM',
        //     text: 'Quelle est la question?',
        //     points: 20,
        //     lastModification: '2024-01-26T14:21:19+00:00',
        // };21q    

        // this.questionService.addQuestion(newQuestion).subscribe((response: HttpResponse<string>) => {
        //     if (response.ok) this.game.questions.push(newQuestion);
        // });

        this.gamesService.verifyGame(this.game);
        //this.createQuestionEvent.emit(newQuestion);
        this.game.questions.push(newQuestion);
        //this.gamesService.verifyGame(this.game);
    }

    saveGame() {
        this.gamesCreationService.sendModifiedGame(this.game);
    }

    toggleCreateQuestion() {
        this.dialogState = !this.dialogState;
    }

    dialogRef: any;

    // https://stackoverflow.com/questions/47592364/usage-of-mat-dialog-close
    openDialog() {
        //this.toggleCreateQuestion();
        //this.dialogState = !this.dialogState;
        // if (!this.dialogState) {
        //     this.toggleCreateQuestion();
        // }

        if (!this.dialogState) {
            this.dialogRef = this.dialog.open(CreateQuestionComponent, {
                height: '70%',
                width: '100%',
            });

            // this.dialogRef.afterClosed().subscribe((newQuestion: Question) => {
            //     if (newQuestion) {
            //         this.addNewQuestion(newQuestion);
            //     }
            //     // Set dialogState to false when the dialog is closed
            //     this.dialogState = false;
            // });

            this.dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
                //this.onNoClick());
                if (newQuestion) {
                    this.addNewQuestion(newQuestion);
                    this.dialogRef.close();
                }

                this.dialogState = false;
            });
        }
    }

    onQuestionCreated(newQuestion: Question) {
        console.log('created', newQuestion);
        this.game.questions.push(newQuestion);

        this.gamesService.addQuestionToGame(this.game.id, newQuestion).subscribe((response: HttpResponse<string>) => {
            if (response.ok) {
                this.response = 'Questionsaved';
            } else {
                this.response = 'Error';
            }
        });
    }

    //  #createQuestionComponent (questionCreated)="onQuestionCreated($event)">
    //onNoClick(): void {
    //     var cn = confirm('Les modifications seront perdues, voulez-vous quitter?');
    //     console.log(cn);
    //      if(cn){
    //   this.dialog.closeAll();
    //      } else{
    //         this.openDialog();
    //      }

    // };

}
