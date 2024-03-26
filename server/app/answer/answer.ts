/* eslint-disable max-classes-per-file */
export abstract class Answer {
    isSubmitted: boolean = false;
    timestamp?: number = undefined;

    resetAnswer(): void {
        this.isSubmitted = false;
        this.timestamp = undefined;
    }

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
}
