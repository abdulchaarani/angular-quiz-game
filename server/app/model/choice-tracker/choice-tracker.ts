import { Choice } from '@app/model/database/choice';
import { ChoiceTally } from '@common/interfaces/choice-tally';

export class ChoiceTracker {
    question: string = '';
    choices: { [key: string]: ChoiceTally } = {};

    resetChoiceTracker(questionText: string, newChoices: Choice[]): void {
        this.question = questionText;
        this.choices = {};
        newChoices.forEach((choice) => {
            this.choices[choice.text] = { text: choice.text, isCorrect: choice.isCorrect, tally: 0 };
        });
    }

    incrementCount(key: string): void {
        if (this.choices[key]) this.choices[key].tally++;
    }

    decrementCount(key: string): void {
        if (this.choices[key] && this.choices[key].tally > 0) this.choices[key].tally--;
    }
}
