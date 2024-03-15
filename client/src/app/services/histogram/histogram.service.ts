import { Injectable } from '@angular/core';
import { ChoiceTally } from '@common/interfaces/choice-tally';
import { Subject } from 'rxjs';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
@Injectable({
    providedIn: 'root',
})
export class HistogramService {
    constructor(public socketService: SocketHandlerService) {}
    private choiceTally = new Subject<ChoiceTally[]>();
    choiceTally$ = this.choiceTally.asObservable();

    currentHistogram() {
        this.socketService.on('currentHistogram', (data: ChoiceTally[]) => {
            this.choiceTally.next(Object.values(data));
        });
    }

    histogramHistory() {
        this.socketService.on('histogramHistory', (data: any) => {
            console.log(data);
        });
    }
}
