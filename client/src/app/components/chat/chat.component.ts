import { Component } from '@angular/core';
import { Message } from '@app/interfaces/message';
//import { MatInputModule } from '@angular/material/input';


@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    currentUsername: string = 'Bibi';
    messages: Message[] = [
        { author: 'Binou', text: 'TOUPIIIIIE', date: new Date() },
        {
            author: 'Bibi',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper.',
            date: new Date(),
        },
        {
            author: 'Organisateur',
            text: 'Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.',
            date: new Date(),
        },
        {
            author: 'Jiji',
            text: 'Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis.',
            date: new Date(),
        },
        {
            author: 'Fifi',
            text: 'Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. ',
            date: new Date(),
        },
        {
            author: 'Bibi',
            text: 'Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna. ',
            date: new Date(),
        },
        { author: 'Kaneshiro', text: 'MY BAAAAANK', date: new Date() },
    ];

    sendMessage(messageText: string) {
        let inputValue = (document.getElementById("chat-input") as HTMLInputElement)?.value; 
        if (messageText !== '') {
            const newMessage: Message = {
                author: this.currentUsername,
                text: messageText,
                date: new Date(),
            };
            this.messages.push(newMessage);
           // document.getElementById('chat-input')!.inputMode= '';
           console.log(inputValue);
        }
        //inputValue. = "";
    }
}
