import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Player } from '@app/interfaces/player';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit, OnDestroy {
    isHost: boolean = true;
    pageEvent: PageEvent;
    players: Player[] = [];
    currentQuestionIndex: number = 0;
    histogramsGame: Histogram[] = [];
    private subscriptions: Subscription[] = [];

    constructor(
        private readonly matchRoomService: MatchRoomService,
        private readonly histogramService: HistogramService,
    ) {}

    ngOnInit(): void {
        this.players = this.matchRoomService.players;
        this.histogramService.histogramHistory();
        this.subscriptions.push(
            this.histogramService.histogramHistory$.subscribe((histograms: Histogram[]) => {
                this.histogramsGame = histograms;
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions = [];
    }

    handlePageEvent(e: PageEvent) {
        this.pageEvent = e;
        this.currentQuestionIndex = e.pageIndex;
    }

    handleDisconnect() {
        this.matchRoomService.disconnect();
    }
}
