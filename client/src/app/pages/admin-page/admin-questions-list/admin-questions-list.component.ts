import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';
import { GamesService } from '@app/services/games.service';
import { QuestionService } from '@app/services/question.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { GamesCreationService } from '@app/services/games-creation.service';
import { NotificationService } from '@app/services/notification.service';
import { DialogConfirmComponent } from '@app/components/dialog-confirm/dialog-confirm.component';
import { concatMap } from 'rxjs';

@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent implements OnInit {
    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() createQuestionEventQuestionBank: EventEmitter<Question> = new EventEmitter<Question>();

    game: Game = {
        id: '',
        title: '',
        description: '',
        lastModification: '',
        duration: 0,
        questions: [],
    };
    response: string = '';
    originalBankQuestions: Question[] = [];
    bankQuestions: Question[] = [];
    isSideBarActive: boolean = false;
    isBankQuestionDragged: boolean = false;
    dialogState: boolean = false;
    isValid: boolean = false;
    //dialogRef: any;
    

    bankMessages = {
        unavailable: "👀 Aucune autre question valide de la banque n'est disponible! 👀",
        available: '🖐 Glissez et déposez une question de la banque dans le jeu! 🖐',
    };

    currentQuestion: Question;
    currentBankMessage = '';
    addToBank: boolean;
    addToBankToggleButtonState: boolean = false;

    gameEditForm = this.formBuilder.nonNullable.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
    });

    gameForm = this.formBuilder.nonNullable.group({
        title: ['', Validators.required],
        description: ['', [Validators.required]],
        duration: ['', Validators.required],
    });

    constructor(
        public dialog: MatDialog,
        private readonly gamesService: GamesService,
        private readonly questionService: QuestionService,
        private readonly gamesCreationService: GamesCreationService,
        private readonly notificationService: NotificationService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
    ) {}

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.game.questions, event.previousIndex, event.currentIndex);
    }

    ngOnInit() {
        this.route.params
            .pipe(
                concatMap((params) => {
                    const id = params['id'];
                    return this.gamesService.getGameById(id);
                }),
                concatMap((game: Game) => {
                    this.game = game;
                    this.isValid = true;
                    return this.questionService.getAllQuestions();
                }),
            )
            .subscribe({
                next: (data: Question[]) => {
                    this.originalBankQuestions = [...data];
                    this.bankQuestions = this.filterBankQuestions(this.originalBankQuestions, this.game.questions);
                    this.setBankMessage();
                },
                error: (error: HttpErrorResponse) =>
                    this.notificationService.displayErrorMessage(`Échec d'obtention des questions 😿\n ${error.message}`),
            });
    }

    changeDuration(event: Event) {
        this.game.duration = Number((event.target as HTMLInputElement).value);
    }

    onSubmit(): void {
        if (this.gameEditForm.value.title && this.gameEditForm.value.description) {
            this.game.title = this.gameEditForm.value.title;
            this.game.description = this.gameEditForm.value.description;
            this.saveGame();
        }

        if (this.gameForm.value.title && this.gameForm.value.description && this.gameForm.value.duration) {
            this.gamesCreationService
                .createGame(this.gameForm.value.title, this.gameForm.value.description, parseInt(this.gameForm.value.duration))
                .subscribe((gameId: string) => {
                    this.router.navigate([`/admin/games/${gameId}/questions`]);
                });
        }
    }

    deleteQuestion(questionId: string) {
        if (this.game.questions.length === 1 || this.game.id === null) {
            return;
        }
        this.game.questions = this.game.questions.filter((question: Question) => question.id !== questionId);
        this.bankQuestions = this.filterBankQuestions(this.originalBankQuestions, this.game.questions);
        this.setBankMessage();
    }

    saveGame() {
        this.gamesService.replaceGame(this.game).subscribe({
            next: () => {
                this.notificationService.displaySuccessMessage('Jeux modifié avec succès! 😺');
            },
            error: (error: HttpErrorResponse) =>
                this.notificationService.displayErrorMessage(`Le jeu n'a pas pu être modifié. 😿 \n ${error.message}`),
        });
    }

    addNewQuestion(newQuestion: Question) {
        console.log('new', newQuestion);
        this.game.questions.push(newQuestion);
    }

    toggleCreateQuestion() {
        this.dialogState = !this.dialogState;
    }

    toggleSideBarClass() {
        this.isSideBarActive = !this.isSideBarActive;
    }

    addQuestionToBank(newQuestion: Question) {
        if (!this.isDuplicateQuestion(newQuestion, this.originalBankQuestions)) {
            this.questionService.createQuestion(newQuestion).subscribe({
                next: () => {
                    this.notificationService.displaySuccessMessage('Question ajoutée à la banque avec succès! 😺');
                    this.originalBankQuestions.unshift(newQuestion);
                },
            });
        } else if (this.isDuplicateQuestion(newQuestion, this.originalBankQuestions)) {
            this.notificationService.displayErrorMessage('Cette question fait déjà partie de la banque! 😾');
        }
    }

    // https://stackoverflow.com/questions/47592364/usage-of-mat-dialog-close
    openCreateQuestionDialog() {
        if (!this.dialogState) {
            const dialogRef = this.dialog.open(CreateQuestionComponent, {
                height: '70%',
                width: '100%',
            });

            dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
                if (!this.isDuplicateQuestion(newQuestion, this.game.questions)) {
                    this.addNewQuestion(newQuestion);
                    if (this.addToBankToggleButtonState) {
                        this.addQuestionToBank(newQuestion);
                    }
                    dialogRef.close();
                } else {
                    this.notificationService.displayErrorMessage('Cette question fait déjà partie de la liste des questions de ce jeu! 😾');
                }
            });

            dialogRef.componentInstance.createQuestionEventQuestionBank.subscribe(() => {
                this.addToBankToggleButtonState = !this.addToBankToggleButtonState;
                this.dialogState = false;
            });
        }
    }
    openConfirmDialog(): void {
        const dialogRef = this.dialog.open(DialogConfirmComponent, {
            data: { text: this.currentQuestion.text },
        });

        dialogRef.afterClosed().subscribe((confirm: boolean) => {
            if (!confirm) return;

            if (!this.isDuplicateQuestion(this.currentQuestion, this.originalBankQuestions)) {
                this.questionService.createQuestion(this.currentQuestion).subscribe({
                    next: () => {
                        this.notificationService.displaySuccessMessage('Question ajoutée à la banque avec succès! 😺');
                    },
                    error: (error: HttpErrorResponse) =>
                        this.notificationService.displayErrorMessage(`La question n'a pas pu être ajoutée. 😿 \n ${error.message}`),
                });
            } else {
                this.notificationService.displayErrorMessage('Cette question fait déjà partie de la banque! 😾');
            }
        });
    }

    dropInQuizList(event: CdkDragDrop<Question[]>) {
        const question: Question = event.previousContainer.data[event.previousIndex];
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else if (!this.isDuplicateQuestion(question, this.game.questions)) {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            this.setBankMessage();
        } else {
            this.notificationService.displayErrorMessage('Cette question fait déjà partie du jeu! 😾');
        }
    }

    dragQuizQuestion(question: Question) {
        this.currentQuestion = question;
    }

    dropQuizQuestion(event: CdkDragEnd<Question[]>) {
        const destination = event.event.target as HTMLInputElement;
        const container = destination.closest('mat-drawer');
        if (container) this.openConfirmDialog();
    }

    dragBankQuestion(): void {
        this.isBankQuestionDragged = true;
    }

    dropBankQuestion(): void {
        this.isBankQuestionDragged = false;
    }

    private setBankMessage() {
        if (this.bankQuestions.length === 0) {
            this.currentBankMessage = this.bankMessages.unavailable;
        } else this.currentBankMessage = this.bankMessages.available;
    }

    private isDuplicateQuestion(newQuestion: Question, questionList: Question[]): boolean {
        return !!questionList.find((question) => question.text === newQuestion.text);
    }

    private filterBankQuestions(bankQuestions: Question[], gameQuestions: Question[]): Question[] {
        return bankQuestions.reduce((questions: Question[], question: Question) => {
            if (!this.isDuplicateQuestion(question, gameQuestions)) questions.push(Object.assign({}, question));
            return questions;
        }, []);
    }
}
