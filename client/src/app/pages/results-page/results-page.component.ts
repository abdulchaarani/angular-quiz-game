import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Player } from '@app/interfaces/player';
import { ConfettiService } from '@app/services/confetti/confetti.service';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MultipleChoiceHistogram } from '@common/interfaces/histogram';
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
    histogramsGame: MultipleChoiceHistogram[] = [];
    private histogramSubscriptions: Subscription[] = [];
    constructor(
        private readonly matchRoomService: MatchRoomService,
        private readonly histogramService: HistogramService,
        private readonly confettiService: ConfettiService,
    ) {}

    ngOnInit(): void {
        this.players = this.matchRoomService.players;
        this.histogramService.onHistogramHistory();
        this.subscribeToHistogramHistory();
        this.confettiService.getWinner();
    }

    ngOnDestroy(): void {
        this.histogramSubscriptions.forEach((subscription) => subscription.unsubscribe());
        this.histogramSubscriptions = [];
    }

    handlePageEvent(event: PageEvent) {
        this.pageEvent = event;
        this.currentQuestionIndex = event.pageIndex;
    }

    handleDisconnect() {
        this.matchRoomService.disconnect();
    }

    private subscribeToHistogramHistory() {
        const histogramHistorySubscription = this.histogramService.histogramHistory$.subscribe((histograms: MultipleChoiceHistogram[]) => {
            this.histogramsGame = histograms;
        });
        this.histogramSubscriptions.push(histogramHistorySubscription);
    }
}
