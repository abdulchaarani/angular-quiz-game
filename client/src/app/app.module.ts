import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionCreationFormComponent } from '@app/components/question-creation-form/question-creation-form.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ChatComponent } from './components/chat/chat.component';
import { DialogAdminPasswordComponent } from './components/dialog-admin-password/dialog-admin-password.component';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm.component';
import { DialogTextInputComponent } from './components/dialog-text-input/dialog-text-input.component';
import { GameListItemComponent } from './components/game-list-item/game-list-item.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { QuestionAreaComponent } from './components/question-area/question-area.component';
import { QuestionListItemComponent } from './components/question-list-item/question-list-item.component';
import { ShortQuestionComponent } from './components/short-question/short-question.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { AdminPageComponent } from './pages/admin-page/admin-main-page/admin-page.component';
import { AdminQuestionBankComponent } from './pages/admin-page/admin-question-bank/admin-question-bank.component';
import { AdminQuestionsListComponent } from './pages/admin-page/admin-questions-list/admin-questions-list.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MatchCreationPageComponent } from './pages/match-creation-page/match-creation-page.component';
import { PlayerPageComponent } from './pages/player-page/player-page.component';
import { ResultsPageComponent } from './pages/results-page/results-page.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { WaitPageComponent } from './pages/wait-page/wait-page.component';
import { SortByLastModificationPipe } from './pipes/sort-by-last-modification.pipe';
import { SortByScorePipe } from './pipes/sort-by-score.pipe';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        HomePageComponent,
        AdminPageComponent,
        PlayerPageComponent,
        MatchCreationPageComponent,
        QuestionListItemComponent,
        AdminQuestionBankComponent,
        AdminQuestionsListComponent,
        GameListItemComponent,
        QuestionAreaComponent,
        QuestionCreationFormComponent,
        SortByLastModificationPipe,
        ClickStopPropagationDirective,
        TestPageComponent,
        ChatComponent,
        WaitPageComponent,
        DialogAdminPasswordComponent,
        ShortQuestionComponent,
        DialogConfirmComponent,
        DialogTextInputComponent,
        ResultsPageComponent,
        PlayersListComponent,
        SortByScorePipe,
        HistogramComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        DragDropModule,
        ReactiveFormsModule,
    ],
    providers: [],
    exports: [QuestionListItemComponent, GameListItemComponent, QuestionCreationFormComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
