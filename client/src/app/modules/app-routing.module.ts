import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionAreaComponent } from '@app/components/question-area/question-area.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AdminQuestionBankComponent } from '@app/pages/admin-page/admin-question-bank/admin-question-bank.component';
import { AdminQuestionsListComponent } from '@app/pages/admin-page/admin-questions-list/admin-questions-list.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { HostPageComponent } from '@app/pages/host-page/host-page.component';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'admin/bank', component: AdminQuestionBankComponent },
    { path: 'admin/games', component: AdminPageComponent },
    { path: 'admin/games/:id/questions', component: AdminQuestionsListComponent },
    { path: 'admin/games/questioncreation', component: CreateQuestionComponent },
    { path: 'host', component: HostPageComponent },
    { path: 'player', component: PlayerPageComponent },
    { path: 'play', component: QuestionAreaComponent },
    // { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
