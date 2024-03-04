import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortByScorePipe } from '@app/pipes/sort-by-score.pipe';
import { PlayersListComponent } from './players-list.component';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;
   // let pipe: SortByScorePipe; // TODO: Mock

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayersListComponent, SortByScorePipe],
            imports: [],
        });
        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
