import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';
import { ChatComponent } from './components/chat/chat.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { DialogAdminPasswordComponent } from './components/dialog-admin-password/dialog-admin-password.component';
import { GameListItemComponent } from './components/game-list-item/game-list-item.component';
import { PlayAreaComponent } from './components/play-area/play-area.component';
import { QuestionAreaComponent } from './components/question-area/question-area.component';
import { QuestionListItemComponent } from './components/question-list-item/question-list-item.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { AdminPageComponent } from './pages/admin-page/admin-main-page/admin-page.component';
import { AdminQuestionBankComponent } from './pages/admin-page/admin-question-bank/admin-question-bank.component';
import { AdminQuestionsListComponent } from './pages/admin-page/admin-questions-list/admin-questions-list.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { HostPageComponent } from './pages/host-page/host-page.component';
import { PlayerPageComponent } from './pages/player-page/player-page.component';
import { TestPageComponent } from './pages/test-page/test-page.component';
import { WaitPageComponent } from './pages/wait-page/wait-page.component';
import { SortByLastModificationPipe } from './pipes/sort-by-last-modification.pipe';
import { AdminQuestionBankSelectionComponent } from './pages/admin-page/admin-questions-list/admin-question-bank-selection/admin-question-bank-selection.component';
import { FormControlPipe } from './pipes/form-control.pipe';
import { ShortQuestionComponent } from './components/short-question/short-question.component';
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
        GameListItemComponent,
        QuestionAreaComponent,
        CreateQuestionComponent,
        SortByLastModificationPipe,
        ClickStopPropagationDirective,
        FormControlPipe,
        TestPageComponent,
        ChatComponent,
        FeedbackComponent,
        WaitPageComponent,
        DialogAdminPasswordComponent,
        AdminQuestionBankSelectionComponent,
        ShortQuestionComponent,
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
    bootstrap: [AppComponent],
})
export class AppModule {}
