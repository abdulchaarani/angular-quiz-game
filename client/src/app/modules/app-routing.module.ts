import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionAreaComponent } from '@app/components/question-area/question-area.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { HostPageComponent } from '@app/pages/host-page/host-page.component';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'admin/games', component: AdminPageComponent },
    { path: 'player', component: PlayerPageComponent },
    { path: 'host', component: HostPageComponent },
    { path: 'play', component: QuestionAreaComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
