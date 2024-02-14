import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagementState } from '@app/constants/states';
import { authenticationGuard } from '@app/guards/authentication.guard';
import { pendingChangesGuard } from '@app/guards/pending-changes.guard';
import { AdminPageComponent } from '@app/pages/admin-page/admin-main-page/admin-page.component';
import { AdminQuestionBankComponent } from '@app/pages/admin-page/admin-question-bank/admin-question-bank.component';
import { AdminQuestionsListComponent } from '@app/pages/admin-page/admin-questions-list/admin-questions-list.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { HostPageComponent } from '@app/pages/host-page/host-page.component';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';
import { TestPageComponent } from '@app/pages/test-page/test-page.component';
import { WaitPageComponent } from '@app/pages/wait-page/wait-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'play', component: TestPageComponent },
    { path: 'home', component: HomePageComponent },
    {
        path: 'admin',
        canActivate: [authenticationGuard],
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
    { path: 'host', component: HostPageComponent },
    { path: 'player', component: PlayerPageComponent },
    { path: 'waiting-room', component: WaitPageComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
