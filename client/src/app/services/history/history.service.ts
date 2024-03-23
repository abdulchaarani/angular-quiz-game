import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HistoryItem } from '@app/interfaces/history-item';
import { CommunicationService } from '@app/services/communication/communication.service';

@Injectable({
    providedIn: 'root',
})
export class HistoryService extends CommunicationService<HistoryItem> {
    historyItems: HistoryItem[];

    constructor(http: HttpClient) {
        super(http, 'history');
        this.historyItems = [];
    }

    getHistory(): void {
        this.getAll().subscribe({
            next: (data: HistoryItem[]) => (this.historyItems = [...data]),
        });
    }

    deleteHistory(): void {
        this.delete('').subscribe({
            next: () => (this.historyItems = []),
        });
    }
}
