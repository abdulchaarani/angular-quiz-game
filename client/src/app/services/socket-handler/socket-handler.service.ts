import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketHandlerService {
    socket: Socket;

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        console.log('Le client tente de se connecter.' + environment.serverUrl);
        this.socket = io(environment.serverUrlWithoutApi, { transports: ['websocket'], upgrade: false });
        console.log(this.socket);
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
}
