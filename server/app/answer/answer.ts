/* eslint-disable max-classes-per-file */
export abstract class Answer {
    isSubmitted: boolean = false;
    timestamp?: number = undefined;

    resetAnswer(): void {
        this.isSubmitted = false;
        this.timestamp = undefined;
    }

    abstract isCorrectAnswer(correctAnswer: string[]): boolean;
    abstract updateChoice(choice: string, selection: boolean): void;
}

export class MultipleChoiceAnswer extends Answer {
    selectedChoices: Map<string, boolean> = new Map<string, boolean>();

    resetAnswer(): void {
        super.resetAnswer();
        this.selectedChoices.clear();
    }

    updateChoice(choice: string, selection?: boolean): void {
        this.selectedChoices.set(choice, selection);
    }

    isCorrectAnswer(correctAnswer: string[]) {
        const playerChoices = this.filterSelectedChoices();
        return playerChoices.sort().toString() === correctAnswer.sort().toString();
    }

    private filterSelectedChoices() {
        const selectedChoices: string[] = [];
        for (const [choice, selection] of this.selectedChoices) {
            if (selection) selectedChoices.push(choice);
        }
        return selectedChoices;
    }
}

export class LongAnswer extends Answer {
    answer: string = '';

    resetAnswer(): void {
        super.resetAnswer();
        this.answer = '';
    }

    updateChoice(choice: string): void {
        this.answer = choice;
    }

    isCorrectAnswer() {
        return true;
    }
}
