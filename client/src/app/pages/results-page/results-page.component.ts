import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Player } from '@app/interfaces/player';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent {
    isHost: boolean = true;
    pageEvent: PageEvent;
    players: Player[] = [];
    currentQuestionIndex: number = 0;
    constructor(
        private matchRoomService: MatchRoomService,
        private histogramService: HistogramService,
    ) {}
    histogramsGame: Histogram[] = [];

    ngOnInit(): void {
        this.players = this.matchRoomService.players;
        this.histogramService.histogramHistory();
        this.histogramService.histogramHist$.subscribe((histograms: Histogram[]) => {
            console.log(histograms);
            this.histogramsGame = histograms;
        });
    }

    handlePageEvent(e: PageEvent) {
        this.pageEvent = e;
        this.currentQuestionIndex = e.pageIndex;
    }
}
