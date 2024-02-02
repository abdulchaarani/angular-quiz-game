import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-main-page/admin-page.component';
import { AdminQuestionBankComponent } from '@app/pages/admin-page/admin-question-bank/admin-question-bank.component';
import { AdminQuestionsListComponent } from '@app/pages/admin-page/admin-questions-list/admin-questions-list.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { HostPageComponent } from '@app/pages/host-page/host-page.component';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';
import { TestPageComponent } from '@app/pages/test-page/test-page.component';
import { WaitPageComponent } from '@app/pages/wait-page/wait-page.component';
import { AdminQuestionBankSelectionComponent } from '@app/pages/admin-page/admin-questions-list/admin-question-bank-selection/admin-question-bank-selection.component';
import { AdminCreateGameComponent } from '@app/pages/admin-page/admin-create-game/admin-create-game.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'play', component: TestPageComponent },
    { path: 'home', component: HomePageComponent },
    { path: 'admin/bank', component: AdminQuestionBankComponent },
    { path: 'admin/games', component: AdminPageComponent },
    { path: 'admin/games/:id/questions', component: AdminQuestionsListComponent },
    { path: 'admin/games/:id/questionbank', component: AdminQuestionBankSelectionComponent },
    { path: 'admin/games/newgame', component: AdminCreateGameComponent },
    { path: 'admin/games/:id/questions/questioncreation', component: CreateQuestionComponent },
    { path: 'host', component: HostPageComponent },
    { path: 'player', component: PlayerPageComponent },
    { path: 'waiting-room', component: WaitPageComponent },
    // { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
