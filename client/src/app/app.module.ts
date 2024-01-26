import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { PlayAreaComponent } from './components/play-area/play-area.component';
import { QuestionListItemComponent } from './components/question-list-item/question-list-item.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { AdminQuestionBankComponent } from './pages/admin-page/admin-question-bank/admin-question-bank.component';
import { AdminQuestionsListComponent } from './pages/admin-page/admin-questions-list/admin-questions-list.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HostPageComponent } from './pages/host-page/host-page.component';
import { PlayerPageComponent } from './pages/player-page/player-page.component';
import { SortByLastModificationPipe } from './sort-by-last-modification.pipe';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        PlayAreaComponent,
        SidebarComponent,
        HomePageComponent,
        AdminPageComponent,
        PlayerPageComponent,
        HostPageComponent,
        QuestionListItemComponent,
        AdminQuestionBankComponent,
        AdminQuestionsListComponent,
        SortByLastModificationPipe,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, DragDropModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
