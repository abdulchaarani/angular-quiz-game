import { Component } from '@angular/core';
import { AdminQuestionBankComponent } from '../../admin-question-bank/admin-question-bank.component';
import { GamesCreationService } from '@app/services/games-creation.service';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-admin-question-bank-selection',
    templateUrl: './admin-question-bank-selection.component.html',
    styleUrls: ['./admin-question-bank-selection.component.scss'],
})
export class AdminQuestionBankSelectionComponent extends AdminQuestionBankComponent {
    gamesCreationService: GamesCreationService;

    selectedQuestions: Question[] = [];

    selectedIndices: boolean[] = Array(this.questions.length).fill(false);

    checkQuestion(index: number) {
        this.selectedIndices[index] = !this.selectedIndices[index];
        console.log('Question checked', index, this.selectedIndices[index]);
    }

    submitQuestions() {
        this.selectedQuestions = this.questions.filter((question, index) => this.selectedIndices[index]);
        console.log('Questions have been added to the game', this.selectedQuestions);
    }
}
