import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketHandlerService {
    socket: Socket;

    constructor(private router: Router) {}

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.serverUrlWithoutApi, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
        this.router.navigateByUrl('/home');
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T, callback?: Function): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }
}