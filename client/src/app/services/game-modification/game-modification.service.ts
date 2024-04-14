import { Injectable } from '@angular/core';
import { GameService } from '../game/game.service';
import { BankService } from '../bank/bank.service';
import { Game } from '@app/interfaces/game';
import { ManagementState } from '@app/constants/states';
import { Question } from '@app/interfaces/question';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BankStatus, QuestionStatus } from '@app/constants/feedback-messages';
import { NotificationService } from '../notification/notification.service';
import { QuestionService } from '../question/question.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialogRef } from '@angular/material/dialog';
import { QuestionCreationFormComponent } from '@app/components/question-creation-form/question-creation-form.component';

@Injectable({
    providedIn: 'root',
})
export class GameModificationService {
    newGame: Game = {
        id: '',
        title: '',
        description: '',
        lastModification: new Date().toString(),
        duration: 10,
        isVisible: false,
        questions: [],
    };

    game: Game;

    state: ManagementState;
    originalBankQuestions: Question[] = [];
    bankQuestions: Question[] = [];
    isSideBarActive: boolean = false;
    isBankQuestionDragged: boolean = false;
    dialogState: boolean = false;
    currentQuestion: Question;
    currentBankMessage = '';

    isPendingChanges: boolean = false;

    gameForm = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        duration: new FormControl('10', Validators.required),
    });

    // permit more constructor params to decouple services
    // eslint-disable-next-line max-params
    constructor(
        private readonly bankService: BankService,
        private readonly gamesService: GameService,
        private readonly notificationService: NotificationService,
        private readonly questionService: QuestionService,
        private readonly router: Router,
    ) {}

    setGame(id: string) {
        this.state = ManagementState.GameModify;
        this.game = { ...this.newGame };
        this.gamesService.getGameById(id).subscribe({
            next: (game: Game) => {
                this.game = game;
                this.resetStateForNewGame();
            },
        });
    }

    setNewGame() {
        this.state = ManagementState.GameCreate;
        this.game = { ...this.newGame };
        this.resetStateForNewGame();
    }

    deleteQuestion(questionId: string) {
        this.game.questions = this.game.questions.filter((question: Question) => question.id !== questionId);
        this.bankQuestions = this.filterBankQuestions(this.originalBankQuestions, this.game.questions);
        this.setBankMessage();
        this.markPendingChanges();
    }

    handleSubmit() {
        if (this.game.title && this.game.description && this.game.duration) {
            this.gamesService.submitGame(this.game, this.state).subscribe({
                next: () => {
                    this.notificationService.displaySuccessMessage(
                        `Jeux ${this.state === ManagementState.GameModify ? 'modifié' : 'créé'} avec succès! 😺`,
                    );
                    this.resetPendingChanges();
                    this.router.navigate(['/admin/games/']);
                },
                error: (error: HttpErrorResponse) =>
                    this.notificationService.displayErrorMessage(
                        `Le jeu n'a pas pu être ${this.state === ManagementState.GameModify ? 'modifié' : 'créé'}. 😿 \n ${error.message}`,
                    ),
            });
        }
    }

    dropInQuizList(event: CdkDragDrop<Question[]>) {
        const droppedQuestion: Question = event.previousContainer.data[event.previousIndex];
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            this.markPendingChanges();
        } else if (!this.isDuplicateQuestion(droppedQuestion, this.game.questions)) {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            this.setBankMessage();
            this.markPendingChanges();
        } else {
            this.notificationService.displayErrorMessage(QuestionStatus.DUPLICATE);
        }
    }

    dragQuizQuestion(question: Question) {
        this.currentQuestion = question;
    }

    dropQuizQuestion(event: CdkDragEnd<Question[]>) {
        const destination = event.event.target as HTMLInputElement;
        const container = destination.closest('mat-sidenav');
        if (container) this.openConfirmDialog();
    }

    dragBankQuestion(): void {
        this.isBankQuestionDragged = true;
    }

    dropBankQuestion(): void {
        this.isBankQuestionDragged = false;
    }

    openCreateQuestionDialog() {
        const dialogRef = this.questionService.openCreateQuestionModal(ManagementState.GameCreate);

        dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
            this.handleCreateQuestionDialog(newQuestion, dialogRef);
        });
    }

    async openConfirmDialog() {
        const confirmation$ = this.notificationService.confirmBankUpload(this.currentQuestion.text);
        const confirmation = await lastValueFrom(confirmation$);
        if (!confirmation) return;
        this.addQuestionToBank(this.currentQuestion);
    }

    private resetStateForNewGame() {
        this.gameForm.patchValue({
            title: this.game.title,
            description: this.game.description,
            duration: this.game.duration.toString(),
        });
        this.subscribeToFormChanges();
        this.setBankQuestions();
        this.resetPendingChanges();
    }

    private setBankQuestions() {
        this.questionService.getAllQuestions().subscribe({
            next: (questions: Question[]) => {
                this.originalBankQuestions = [...questions];
                this.bankQuestions = this.filterBankQuestions(this.originalBankQuestions, this.game.questions);
                this.setBankMessage();
            },
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${BankStatus.UNRETRIEVED}\n ${error.message}`),
        });
    }

    private subscribeToFormChanges() {
        this.gameForm.get('title')?.valueChanges.subscribe((title: string | null) => {
            if (title) {
                this.game.title = title;
                this.markPendingChanges();
            }
        });

        this.gameForm.get('description')?.valueChanges.subscribe((description: string | null) => {
            if (description) {
                this.game.description = description;
                this.markPendingChanges();
            }
        });

        this.gameForm.get('duration')?.valueChanges.subscribe((duration: string | null) => {
            if (duration) {
                this.game.duration = parseInt(duration, 10);
                this.markPendingChanges();
            }
        });
    }

    private addQuestionToBank(newQuestion: Question) {
        if (!this.isDuplicateQuestion(newQuestion, this.originalBankQuestions)) {
            this.bankService.addQuestion(newQuestion);
            this.originalBankQuestions.push(newQuestion);
        }
    }

    private handleCreateQuestionDialog(newQuestion: Question, dialogRef: MatDialogRef<QuestionCreationFormComponent, unknown>) {
        this.addQuestionToGame(newQuestion);
        dialogRef.close();
    }

    private addQuestionToGame(newQuestion: Question) {
        this.questionService.verifyQuestion(newQuestion).subscribe({
            next: () => {
                this.notificationService.displaySuccessMessage(QuestionStatus.VERIFIED);
                this.game.questions.push(newQuestion);
                this.markPendingChanges();
                if (this.bankService.addToBank) {
                    this.originalBankQuestions.push(newQuestion);
                }
            },
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${QuestionStatus.UNVERIFIED} \n ${error.message}`),
        });
    }

    private setBankMessage() {
        this.currentBankMessage = this.bankQuestions.length === 0 ? BankStatus.UNAVAILABLE : BankStatus.AVAILABLE;
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

    private markPendingChanges() {
        this.isPendingChanges = true;
    }

    private resetPendingChanges() {
        this.isPendingChanges = false;
    }
}
