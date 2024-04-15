import { Injectable } from '@angular/core';
import { PANIC_SOUND } from '@app/constants/sounds-sources';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { AudioEvents } from '@common/events/audio.events';
import { NotificationService } from '@app/services/notification/notification.service';

@Injectable({
    providedIn: 'root',
})
export class AudioPlayerService {
    private audioObject: HTMLAudioElement = new Audio();

    constructor(
        private readonly socketHandlerService: SocketHandlerService,
        private readonly notificationService: NotificationService,
    ) {}

    triggerPanicSound(roomCode: string) {
        this.socketHandlerService.send(AudioEvents.PlayPanicSound, roomCode);
    }

    onPlayPanicSound() {
        this.socketHandlerService.on(AudioEvents.PlayPanicSound, () => {
            this.playPanicSound();
        });
    }

    private playPanicSound() {
        this.setAudio(PANIC_SOUND);
        this.playAudio();
    }

    private setAudio(url: string) {
        this.audioObject.src = url;
    }

    private playAudio() {
        this.audioObject.play().finally(() => this.notificationService.displayErrorMessage('❗ MODE PANIQUE ACTIVÉ! ❗'));
    }
}
