import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class GameEventService {
    private questionAdvanceSubject = new Subject<void>();

    questionAdvanced$ = this.questionAdvanceSubject.asObservable();

    constructor() {}

    advanceQuestion() {
        this.questionAdvanceSubject.next();
    }
}
