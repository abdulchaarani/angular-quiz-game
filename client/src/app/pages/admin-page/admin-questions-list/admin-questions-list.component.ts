import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Question } from '@app/interfaces/question';
//import { QuestionService } from '@app/services/question.service';
//import { QuestionListItemComponent } from '@app/components/question-list-item/question-list-item.component';

// import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';

@Component({
    selector: 'app-admin-questions-list',
    templateUrl: './admin-questions-list.component.html',
    styleUrls: ['./admin-questions-list.component.scss'],
})
export class AdminQuestionsListComponent {


    response: string = '';

    //constructor(private readonly questionService: QuestionService) {}

    questions: Question[] = [
        {
            // type: 'QCM',
            // description: 'Vitesse de la lumière.',
            // question: 'Quelle est la vitesse de la lumière ?',
            // points: 10,
            // lastModification: '2019-03-12T10:11:33+00:00',
            type: '',
            description: '',
            question: '',
            points: 10,
            lastModification: '',
        },

        {
            type: 'QCM',
            description: 'Mort de Michael Jackson',
            question: 'Quand est mort Michael Jackson ?',
            points: 15,
            lastModification: '2019-01-27T10:11:33+00:00',
        },

    ];


    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }

    
}
