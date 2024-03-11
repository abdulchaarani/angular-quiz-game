import { Injectable } from '@angular/core';
//import { Message } from '@app/interfaces/message';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
  
    socket: Socket;
    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T, callback?: Function): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }

    sendMessage(messageText: string) {
        if (messageText !== '') {
            // const newMessage: Message = {
            //     // author: this.currentUsername,
            //     text: messageText,
            //     date: new Date(),
            // };
            //this.messages.push(newMessage);
        }
    }
}
