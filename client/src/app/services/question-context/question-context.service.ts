import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class QuestionContextService {
    private context: 'testPage' | 'hostView' | 'playerView';

    setContext(context: 'testPage' | 'hostView' | 'playerView'): void {
        this.context = context;
    }

    getContext(): 'testPage' | 'hostView' | 'playerView' {
        return this.context;
    }
}
