/* eslint-disable max-classes-per-file */
import { Choice } from '@app/model/database/choice';
import { ChoiceTally, GradeTally, Tally } from '@common/interfaces/choice-tally';

class Tracker<T extends Tally> {
    question: string = '';
    items: { [key: string]: T } = {};

    incrementCount(key: string): void {
        if (this.items[key]) this.items[key].tally++;
    }

    decrementCount(key: string): void {
        if (this.items[key] && this.items[key].tally > 0) this.items[key].tally--;
    }

    resetTracker(questionText: string): void {
        this.question = questionText;
        this.items = {};
    }
}

export class ChoiceTracker extends Tracker<ChoiceTally> {
    resetChoiceTracker(questionText: string, newChoices: Choice[]): void {
        super.resetTracker(questionText);
        newChoices.forEach((choice) => {
            this.items[choice.text] = { text: choice.text, isCorrect: choice.isCorrect, tally: 0 };
        });
    }
}

export class GradeTracker extends Tracker<GradeTally> {
    resetGradeTracker(questionText: string, possibleGrades: string[]): void {
        super.resetTracker(questionText);
        possibleGrades.forEach((grade) => {
            this.items[grade].tally = 0;
        });
    }
}
