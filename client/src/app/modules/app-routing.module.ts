import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { HostPageComponent } from '@app/pages/host-page/host-page.component';
import { PlayerPageComponent } from '@app/pages/player-page/player-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomePageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'player/playMatch', component: PlayerPageComponent },
    { path: 'host/createMatch', component: HostPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
