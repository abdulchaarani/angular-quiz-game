import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HostQuestionAreaComponent } from '@app/components/host-question-area/host-question-area.component';
import { ManagementState } from '@app/constants/states';
import { adminLoginGuard } from '@app/guards/admin-login/admin-login.guard';
import { matchLoginGuard } from '@app/guards/match-login/match-login.guard';
import { pendingChangesGuard } from '@app/guards/pending-changes/pending-changes.guard';
import { AdminPageComponent } from '@app/pages/admin-page/admin-main-page/admin-page.component';
import { AdminQuestionBankComponent } from '@app/pages/admin-page/admin-question-bank/admin-question-bank.component';
import { AdminQuestionsListComponent } from '@app/pages/admin-page/admin-questions-list/admin-questions-list.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { MatchCreationPageComponent } from '@app/pages/match-creation-page/match-creation-page.component';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';
import { ResultsPageComponent } from '@app/pages/results-page/results-page.component';
import { TestPageComponent } from '@app/pages/test-page/test-page.component';
import { WaitPageComponent } from '@app/pages/wait-page/wait-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'play', component: TestPageComponent },
    { path: 'home', component: HomePageComponent },
    {
        path: 'admin',
        canActivate: [adminLoginGuard],
        children: [
            { path: 'bank', component: AdminQuestionBankComponent },
            { path: 'games', component: AdminPageComponent },
            {
                path: 'games/new',
                component: AdminQuestionsListComponent,
                data: { state: ManagementState.GameCreate },
                canDeactivate: [pendingChangesGuard],
            },
            {
                path: 'games/:id',
                component: AdminQuestionsListComponent,
                data: { state: ManagementState.GameModify },
                canDeactivate: [pendingChangesGuard],
            },
        ],
    },
    { path: 'host', component: MatchCreationPageComponent },
    { path: 'player', canActivate: [matchLoginGuard], component: PlayerPageComponent },
    { path: 'match-room', canActivate: [matchLoginGuard], component: WaitPageComponent },
    { path: 'results', canActivate: [matchLoginGuard], component: ResultsPageComponent },
    { path: 'hostpc', canActivate: [matchLoginGuard], component: HostQuestionAreaComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
