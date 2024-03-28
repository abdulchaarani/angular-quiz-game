import { Injectable } from '@angular/core';
import { MultipleChoiceHistogram } from '@common/interfaces/histogram';
import { Observable, Subject } from 'rxjs';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
@Injectable({
    providedIn: 'root',
})
export class HistogramService {
    currentHistogram$: Observable<MultipleChoiceHistogram>;
    histogramHistory$: Observable<MultipleChoiceHistogram[]>;
    private currentHistogramSource = new Subject<MultipleChoiceHistogram>();
    private histogramHistorySource = new Subject<MultipleChoiceHistogram[]>();

    constructor(public socketService: SocketHandlerService) {
        this.currentHistogram$ = this.currentHistogramSource.asObservable();
        this.histogramHistory$ = this.histogramHistorySource.asObservable();
    }

    onCurrentHistogram() {
        this.socketService.on('currentHistogram', (data: MultipleChoiceHistogram) => {
            this.currentHistogramSource.next(data);
        });
    }

    onHistogramHistory() {
        this.socketService.on('histogramHistory', (data: MultipleChoiceHistogram[]) => {
            this.histogramHistorySource.next(data);
        });
    }
}
