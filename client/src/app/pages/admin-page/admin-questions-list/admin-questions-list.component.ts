import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BankStatus, GameStatus, QuestionStatus } from '@app/feedback-messages';
import { CanComponentDeactivate, CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GamesService } from '@app/services/games.service';
import { NotificationService } from '@app/services/notification.service';
import { QuestionService } from '@app/services/question.service';
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

    state: string = '';
    originalBankQuestions: Question[] = [];
    bankQuestions: Question[] = [];
    isSideBarActive: boolean = false;
    isBankQuestionDragged: boolean = false;
    dialogState: boolean = false;
    currentQuestion: Question;
    currentBankMessage = '';
    addToBank: boolean;
    addToBankToggleButtonState: boolean = false;

    gameForm = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        duration: new FormControl('10', Validators.required),
    });

    isPendingChanges: boolean;
    private isPendingChangesSubscription: Subscription = new Subscription();

    // eslint-disable-next-line max-params
    constructor(
        private readonly gamesService: GamesService,
        private readonly notificationService: NotificationService,
        private readonly questionService: QuestionService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    canDeactivate(): CanDeactivateType {
        if (this.isPendingChanges) {
            const deactivateSubject = new Subject<boolean>();
            this.notificationService.openPendingChangesConfirmDialog().subscribe((confirm: boolean) => deactivateSubject.next(confirm));
            return deactivateSubject;
        }
        return true;
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
        const isModifyState = iif(() => this.state === 'modify', this.setGame(), this.questionService.getAllQuestions());

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
        if (this.gameForm.value.title && this.gameForm.value.description && this.gameForm.value.duration) {
            this.game.title = this.gameForm.value.title;
            this.game.description = this.gameForm.value.description;
            this.game.duration = parseInt(this.gameForm.value.duration, 10);

            this.gamesService.submitGame(this.game, this.state).subscribe({
                next: () => {
                    this.notificationService.displaySuccessMessage(`Jeux ${this.state === 'modify' ? 'modifié' : 'créé'} avec succès! 😺`);
                    this.gamesService.resetPendingChanges();
                    this.router.navigate(['/admin/games/']);
                },
                error: (error: HttpErrorResponse) =>
                    this.notificationService.displayErrorMessage(
                        `Le jeu n'a pas pu être ${this.state === 'modify' ? 'modifié' : 'créé'}. 😿 \n ${error.message}`,
                    ),
            });
        }
    }

    addNewQuestion(newQuestion: Question) {
        this.questionService.verifyQuestion(newQuestion).subscribe({
            next: () => {
                this.notificationService.displaySuccessMessage(QuestionStatus.VERIFIED);
            },
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${QuestionStatus.UNVERIFIED} \n ${error.message}`),
        });
        this.game.questions.push(newQuestion);
        this.gamesService.markPendingChanges();
    }

    deleteQuestion(questionId: string) {
        if (this.game.questions.length === 1 || this.game.id === null) return;

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

    openCreateQuestionDialog() {
        if (!this.dialogState) {
            const dialogRef = this.notificationService.openCreateQuestionModal();

            dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
                if (!this.isDuplicateQuestion(newQuestion, this.game.questions)) {
                    this.addNewQuestion(newQuestion);
                    if (this.addToBankToggleButtonState) {
                        this.addQuestionToBank(newQuestion);
                    }
                    dialogRef.close();
                } else {
                    this.notificationService.displayErrorMessage(GameStatus.DUPLICATE);
                }
            });

            dialogRef.componentInstance.createQuestionEventQuestionBank.subscribe(() => {
                this.addToBankToggleButtonState = !this.addToBankToggleButtonState;
                this.dialogState = false;
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
