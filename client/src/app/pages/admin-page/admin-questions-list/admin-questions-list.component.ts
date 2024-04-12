import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionCreationFormComponent } from '@app/components/question-creation-form/question-creation-form.component';
import { BankStatus, GameStatus, QuestionStatus, WarningMessage } from '@app/constants/feedback-messages';
import { ManagementState } from '@app/constants/states';
import { CanComponentDeactivate, CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionService } from '@app/services/question/question.service';
import { Subject, Subscription, concatMap, iif, lastValueFrom } from 'rxjs';
@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {
    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() createQuestionEventQuestionBank: EventEmitter<Question> = new EventEmitter<Question>();

    game: Game = {
        id: '',
        title: '',
        description: '',
        lastModification: new Date().toString(),
        duration: 10,
        isVisible: false,
        questions: [],
    };

    state: ManagementState;
    originalBankQuestions: Question[] = [];
    bankQuestions: Question[] = [];
    isSideBarActive: boolean = false;
    isBankQuestionDragged: boolean = false;
    dialogState: boolean = false;
    currentQuestion: Question;
    currentBankMessage = '';
    addToBank: boolean;

    gameForm = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        duration: new FormControl('10', Validators.required),
    });

    isPendingChanges: boolean;
    private isPendingChangesSubscription: Subscription = new Subscription();

    // permit more constructor params to decouple services
    // eslint-disable-next-line max-params
    constructor(
        private readonly gamesService: GameService,
        private readonly notificationService: NotificationService,
        private readonly questionService: QuestionService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) {}

    canDeactivate(): CanDeactivateType {
        if (!this.isPendingChanges) return true;

        const deactivateSubject = new Subject<boolean>();
        this.notificationService.openWarningDialog(WarningMessage.PENDING).subscribe((confirm: boolean) => deactivateSubject.next(confirm));
        return deactivateSubject;
    }

    setGame() {
        return this.route.params.pipe(
            concatMap((params) => {
                const id = params.id;
                return this.gamesService.getGameById(id);
            }),
            concatMap((game: Game) => {
                this.game = game;
                this.gameForm.patchValue({
                    title: this.game.title,
                    description: this.game.description,
                    duration: this.game.duration.toString(),
                });
                return this.questionService.getAllQuestions();
            }),
        );
    }

    ngOnInit() {
        this.route.data.subscribe((data) => (this.state = data.state));
        this.isPendingChangesSubscription = this.gamesService.isPendingChangesObservable.subscribe((change) => (this.isPendingChanges = change));
    }

    ngAfterViewInit() {
        const isModifyState = iif(() => this.state === ManagementState.GameModify, this.setGame(), this.questionService.getAllQuestions());

        isModifyState.subscribe({
            next: (data: Question[]) => {
                this.originalBankQuestions = [...data];
                this.bankQuestions = this.filterBankQuestions(this.originalBankQuestions, this.game.questions);
                this.setBankMessage();
                this.gamesService.resetPendingChanges();
            },
            error: (error: HttpErrorResponse) => {
                this.notificationService.displayErrorMessage(`${GameStatus.FAILURE}\n${error.message}`);
            },
        });

        this.gameForm.get('title')?.valueChanges.subscribe(() => this.gamesService.markPendingChanges());
        this.gameForm.get('description')?.valueChanges.subscribe(() => this.gamesService.markPendingChanges());
        this.gameForm.get('duration')?.valueChanges.subscribe(() => this.gamesService.markPendingChanges());
    }

    ngOnDestroy() {
        this.isPendingChangesSubscription.unsubscribe();
    }

    changeDuration(event: Event) {
        this.game.duration = Number((event.target as HTMLInputElement).value);
    }

    handleSubmit() {
        if (this.gameForm.valid) {
            const title = this.gameForm.value.title;
            if (title) {
                this.game.title = title;
            }
            const description = this.gameForm.value.description;
            if (description) {
                this.game.description = description;
            }
            const duration = this.gameForm.value.duration;
            if (duration) {
                this.game.duration = parseInt(duration, 10);
            }

            this.gamesService.submitGame(this.game, this.state).subscribe({
                next: () => {
                    this.notificationService.displaySuccessMessage(
                        `Jeux ${this.state === ManagementState.GameModify ? 'modifié' : 'créé'} avec succès! 😺`,
                    );
                    this.gamesService.resetPendingChanges();
                    this.router.navigate(['/admin/games/']);
                },
                error: (error: HttpErrorResponse) =>
                    this.notificationService.displayErrorMessage(
                        `Le jeu n'a pas pu être ${this.state === ManagementState.GameModify ? 'modifié' : 'créé'}. 😿 \n ${error.message}`,
                    ),
            });
        }
    }

    addQuestionToGame(newQuestion: Question) {
        this.questionService.verifyQuestion(newQuestion).subscribe({
            next: () => {
                this.notificationService.displaySuccessMessage(QuestionStatus.VERIFIED);
                this.game.questions.push(newQuestion);
                this.gamesService.markPendingChanges();
            },
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${QuestionStatus.UNVERIFIED} \n ${error.message}`),
        });
    }

    addQuestionToBank(newQuestion: Question) {
        if (!this.isDuplicateQuestion(newQuestion, this.originalBankQuestions)) {
            this.questionService.createQuestion(this.currentQuestion).subscribe({
                next: () => {
                    this.notificationService.displaySuccessMessage(BankStatus.SUCCESS);
                    this.originalBankQuestions.unshift(this.currentQuestion);
                },
                error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${BankStatus.FAILURE}\n ${error.message}`),
            });
        } else {
            this.notificationService.displayErrorMessage(BankStatus.DUPLICATE);
        }
    }

    deleteQuestion(questionId: string) {
        if (this.game.questions.length === 1 || !this.game.id) return;

        this.game.questions = this.game.questions.filter((question: Question) => question.id !== questionId);
        this.bankQuestions = this.filterBankQuestions(this.originalBankQuestions, this.game.questions);
        this.setBankMessage();
        this.gamesService.markPendingChanges();
    }

    toggleCreateQuestion() {
        this.dialogState = !this.dialogState;
    }

    toggleSideBarClass() {
        this.isSideBarActive = !this.isSideBarActive;
    }

    openCreateQuestionDialog() {
        if (!this.dialogState) {
            const dialogRef = this.questionService.openCreateQuestionModal(ManagementState.GameCreate);

            dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
                this.handleCreateQuestionDialog(newQuestion, dialogRef);
            });
        }
    }

    async openConfirmDialog() {
        const confirmation$ = this.notificationService.confirmBankUpload(this.currentQuestion.text);
        const confirmation = await lastValueFrom(confirmation$);
        if (!confirmation) return;
        this.addQuestionToBank(this.currentQuestion);
    }

    dropInQuizList(event: CdkDragDrop<Question[]>) {
        const droppedQuestion: Question = event.previousContainer.data[event.previousIndex];
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            this.gamesService.markPendingChanges();
        } else if (!this.isDuplicateQuestion(droppedQuestion, this.game.questions)) {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
            this.setBankMessage();
            this.gamesService.markPendingChanges();
        } else {
            this.notificationService.displayErrorMessage(QuestionStatus.DUPLICATE);
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

    getTitle() {
        return this.state === ManagementState.GameModify ? 'Modification' : 'Création';
    }

    getButtonText() {
        return this.state === ManagementState.GameModify ? 'Appliquer les modifications' : 'Créer le jeu';
    }

    private handleCreateQuestionDialog(newQuestion: Question, dialogRef: MatDialogRef<QuestionCreationFormComponent, unknown>) {
        this.addQuestionToGame(newQuestion);
        dialogRef.close();
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
}
