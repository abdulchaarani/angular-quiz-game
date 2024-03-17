import { Injectable } from '@angular/core';
// import { ChoiceTally } from '@common/interfaces/choice-tally';
import { Histogram } from '@common/interfaces/histogram';
import { Subject } from 'rxjs';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
@Injectable({
    providedIn: 'root',
})
export class HistogramService {
    constructor(public socketService: SocketHandlerService) {}
    private choiceTally = new Subject<Histogram>();
    choiceTally$ = this.choiceTally.asObservable();
    private histogramHist = new Subject<Histogram[]>();
    histogramHist$ = this.histogramHist.asObservable();

    currentHistogram() {
        this.socketService.on('currentHistogram', (data: Histogram) => {
            this.choiceTally.next(data);
        });
    }

    histogramHistory() {
        this.socketService.on('histogramHistory', (data: Histogram[]) => {
            this.histogramHist.next(data);
        });
    }
}
