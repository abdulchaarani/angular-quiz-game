import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';
import { SortByScorePipe } from '@app/pipes/sort-by-score.pipe';
import { SortPlayersPipe } from '@app/pipes/sort-players.pipe';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayersListComponent } from './players-list.component';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;
    let matchRoomSpy: jasmine.SpyObj<MatchRoomService>;

    beforeEach(() => {
        matchRoomSpy = jasmine.createSpyObj(MatchRoomService, ['gameOver', 'getUsername']);
        matchRoomSpy.players = [];
        TestBed.configureTestingModule({
            declarations: [PlayersListComponent, SortByScorePipe, SortPlayersPipe],
            providers: [{ provide: MatchRoomService, useValue: matchRoomSpy }],
        });
        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
        component.players = [] as Player[];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
